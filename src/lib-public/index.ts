import { generateInvoice } from './generate-invoice';
import { generatePDFUPO } from './UPO-generator';
import type { AdditionalDataTypes } from './types/common.types';

export { generateInvoice, generatePDFUPO };

// --- Hook dla backendu (Playwright) ---
declare global {
  interface Window {
    generateInvoicePdf?: (xml: string) => Promise<Uint8Array>;
  }
}

// Minimalne wartości – na start, doprecyzujemy jeśli generator tego wymaga
const defaultAdditionalData: AdditionalDataTypes = {} as any;

if (typeof window !== "undefined") {
  window.generateInvoicePdf = async (xml: string) => {
    const blob = new Blob([xml], { type: "application/xml" });
    const file = new File([blob], "invoice.xml", { type: "application/xml" });

    const pdfBlob = await generateInvoice(file, defaultAdditionalData, "blob");
    const buf = await pdfBlob.arrayBuffer();
    return new Uint8Array(buf);
  };
}
