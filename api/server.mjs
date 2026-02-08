import express from "express";
import { chromium } from "playwright";

const app = express();
app.use(express.text({ type: "*/*", limit: "15mb" }));

app.get("/health", (req, res) => res.status(200).send("ok"));

app.post("/render/invoice", async (req, res) => {
  const xml = req.body;
  if (!xml || typeof xml !== "string") return res.status(400).send("XML required");

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto("file:///app/dist/index.html", { waitUntil: "networkidle" });

  // UWAGA: to zadziała dopiero, gdy dodamy w froncie window.generateInvoicePdf (pkt 6)
  const base64 = await page.evaluate(async (invoiceXml) => {
    if (typeof window.generateInvoicePdf !== "function") {
      throw new Error("window.generateInvoicePdf is not available (frontend hook missing).");
    }
    const bytes = await window.generateInvoicePdf(invoiceXml);
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

    let binary = "";
    for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
    return btoa(binary);
  }, xml);

  await browser.close();

  const pdf = Buffer.from(base64, "base64");
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline; filename=invoice.pdf");
  res.send(pdf);
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
