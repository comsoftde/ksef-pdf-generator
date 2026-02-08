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
app.use("/", express.static("/app/dist"));

app.get("/health", (req, res) => res.status(200).send("ok"));

app.post("/render/invoice", async (req, res) => {
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
    await page.goto("http://127.0.0.1:8080/", { waitUntil: "networkidle" });

   const base64 = await page.evaluate(async ({ xml, additionalData }) => {
    if (typeof window.generateInvoicePdf !== "function") {
      throw new Error("window.generateInvoicePdf is not available");
    }
  
    const bytes = await window.generateInvoicePdf(xml, additionalData);
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  
    let binary = "";
    for (let i = 0; i < arr.length; i++) {
      binary += String.fromCharCode(arr[i]);
    }
  
    return btoa(binary);
  }, { xml, additionalData });

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


const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
