import { generateInvoice } from "./lib-public/generate-invoice";
import type { AdditionalDataTypes } from "./lib-public/types/common.types";

declare global {
  interface Window {
    generateInvoicePdf?: (xml: string) => Promise<Uint8Array>;
  }
}

// Minimalne wartości – potem doprecyzujemy, jeśli typ wymaga pól
const defaultAdditionalData: AdditionalDataTypes = {} as any;

console.log("[HOOK] hook-generateInvoicePdf loaded"); // <--- ważne do diagnozy

if (typeof window !== "undefined") {
  window.generateInvoicePdf = async (xml: string) => {
    const blob = new Blob([xml], { type: "application/xml" });
    const file = new File([blob], "invoice.xml", { type: "application/xml" });

    const pdfBlob = await generateInvoice(file, defaultAdditionalData, "blob");
    const buf = await pdfBlob.arrayBuffer();
    return new Uint8Array(buf);
  };

  console.log("[HOOK] window.generateInvoicePdf set:", typeof window.generateInvoicePdf);
}
