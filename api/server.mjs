import express from "express";
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.text({ type: "*/*", limit: "15mb" }));

// serwuj build frontu
// app.use("/", express.static("/app/dist"));


function requireApiKey(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) {
    return res.status(500).type("text/plain").send("API_KEY not configured");
  }

  const got = req.get("x-api-key");
  if (!got || got !== expected) {
    return res.status(401).type("text/plain").send("Unauthorized");
  }

  next();
}


app.get("/health", (req, res) => res.status(200).send("ok"));

app.post("/render/invoice", requireApiKey, async (req, res) => {
  try {
    let xml;
    let additionalData = {};

    if (req.is("application/json")) {
      xml = req.body?.xml;
      additionalData = req.body?.additionalData ?? {};
    } else {
      // stary tryb: czysty XML
      xml = req.body;
      additionalData = {};
    }

    if (!xml || typeof xml !== "string") {
      return res.status(400).type("text/plain").send("XML required");
    }

    const browser = await chromium.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();

page.on("pageerror", (err) => console.error("PAGEERROR:", err));
page.on("console", (msg) => console.log("BROWSER:", msg.type(), msg.text()));
page.on("framenavigated", (frame) => {
  if (frame === page.mainFrame()) console.log("NAV:", frame.url());
});
page.on("requestfailed", (req) =>
  console.log("REQFAIL:", req.url(), req.failure()?.errorText)
);




    
    await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
    //await page.goto("file:///app/dist/index.html", { waitUntil: "domcontentloaded" });

    await page.waitForFunction(
  () => typeof window.generateInvoicePdf === "function",
  null,
  { timeout: 30000 }
);

    async function evalRetry(page, fn, arg) {
  try {
    return await page.evaluate(fn, arg);
  } catch (e) {
    const msg = String(e?.message || e);
    if (msg.includes("Execution context was destroyed")) {
      console.log("EVAL RETRY (context destroyed)...");
      await page.waitForTimeout(300);
      await page.waitForFunction(() => typeof window.generateInvoicePdf === "function", null, { timeout: 30000 });
      return await page.evaluate(fn, arg);
    }
    throw e;
  }
}

    const base64 = await evalRetry(
  page,
  async ({ xml, additionalData }) => {
    const bytes = await window.generateInvoicePdf(xml, additionalData);
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

    let binary = "";
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
    return btoa(binary);
  },
  { xml, additionalData }
);
    
   //const base64 = await page.evaluate(async ({ xml, additionalData }) => {
   // if (typeof window.generateInvoicePdf !== "function") {
   //   throw new Error("window.generateInvoicePdf is not available");
   // }
  
   // const bytes = await window.generateInvoicePdf(xml, additionalData);
   // const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  
   // let binary = "";
   // for (let i = 0; i < arr.length; i++) {
   //   binary += String.fromCharCode(arr[i]);
   // }
  
   // return btoa(binary);
  //}, { xml, additionalData });

    await browser.close();

    const pdf = Buffer.from(base64, "base64");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");
    res.send(pdf);
  } catch (e) {
    console.error(e);
    res.status(500).type("text/plain").send(String(e?.stack || e));
  }
});

// 1) Statyki (index.html + assets) – dostępne tylko lokalnie w kontenerze
app.use((req, res, next) => {
  // Pozwól tylko na loopback / docker bridge
  const ip = req.socket.remoteAddress || "";

  const isLocal =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("::ffff:127.0.0.1") ||
    ip.startsWith("10.") ||      // często adresy sieci w kontenerach
    ip.startsWith("172.") ||     // docker bridge
    ip.startsWith("192.168.");

  // Dozwól na statyki tylko jeśli request jest "lokalny"
  if (!isLocal) return res.status(404).send("Not found");

  next();
}, express.static("/app/dist", {
  index: "index.html",
  extensions: ["html"]
}));

app.use((req, _res, next) => {
  console.log("HTTP", req.method, req.url, "remote:", req.socket.remoteAddress);
  next();
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
