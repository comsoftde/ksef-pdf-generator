import pdfMake from "pdfmake/build/pdfmake";
import fontUrl from "../assets/fonts/NotoSans-Regular.ttf?url";
import { generateInvoice, generatePDFUPO } from '../lib-public';

import { AdditionalDataTypes } from '../lib-public/types/common.types';

console.log("[PUBLIC] main.ts loaded");


const inputInvoice: HTMLInputElement = document.getElementById('xmlInput') as HTMLInputElement;
const inputUPO: HTMLInputElement = document.getElementById('xmlInputUPO') as HTMLInputElement;

inputInvoice.addEventListener('change', async (): Promise<void> => {
  const file: File | undefined = inputInvoice.files?.[0];

  if (!file) {
    return;
  }

  const additionalData: AdditionalDataTypes = {
    nrKSeF: '5555555555-20250808-9231003CA67B-BE',
    qrCode:
      'https://ksef-test.mf.gov.pl/invoice/5265877635/26-10-2025/HS5E1zrA8WVjDNq_xMVIN5SD6nyRymmQ-BcYHReUAa0',
  };

  generateInvoice(file, additionalData, 'blob').then((data: Blob): void => {
    const url: string = URL.createObjectURL(data);

    const a: HTMLAnchorElement = document.createElement('a');

    a.href = url;
    a.download = 'test.pdf';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

inputUPO.addEventListener('change', async (): Promise<void> => {
  const file: File | undefined = inputUPO.files?.[0];

  if (!file) {
    return;
  }
  generatePDFUPO(file).then((blob) => {
    const url: string = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement('a');

    a.href = url;
    a.download = 'test.pdf';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
});

// import { generateInvoice } from '../lib-public';
// (jeśli już masz import generateInvoice, to nie dubluj)

declare global {
  interface Window {
    generateInvoicePdf?: (xml: string, additionalData?: any) => Promise<Uint8Array>;
  }
}

// Minimalne additionalData — dopasuj jeśli Twoje UI wymaga pól obowiązkowych

const defaultAdditionalData: any = {};

console.log("[PUBLIC] setting window.generateInvoicePdf");

let fontsReady: Promise<void> | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function ensurePdfFonts(): Promise<void> {
  if (fontsReady) return fontsReady;

  fontsReady = (async () => {
    console.log("[PUBLIC] Loading font:", fontUrl);

    const res = await fetch(fontUrl);
    if (!res.ok) throw new Error(`Font fetch failed: ${res.status} ${res.statusText}`);

    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);

    (pdfMake as any).vfs = {
      ...(pdfMake as any).vfs,
      "NotoSans-Regular.ttf": base64,
    };

    (pdfMake as any).fonts = {
      ...(pdfMake as any).fonts,
      Noto: {
        normal: "NotoSans-Regular.ttf",
        bold: "NotoSans-Regular.ttf",
        italics: "NotoSans-Regular.ttf",
        bolditalics: "NotoSans-Regular.ttf",
      },
    };

    console.log("[PUBLIC] pdfMake fonts ready");
  })();

  return fontsReady;
}

window.generateInvoicePdf = async (xml: string, additionalData: any = {}) => {
   await ensurePdfFonts();

  // WYMUSZAMY, żeby generator używał fontu Noto:
  // Najprościej: dorzuć w additionalData flagę/ustawienie jeśli masz taką opcję,
  // ale jeśli nie – to i tak większość generatorów bierze defaultStyle z docDefinition.
  // Jeśli nadal nie, dopniemy to w generatorze (defaultStyle.font = "Noto").

  const blob = new Blob([xml], { type: "application/xml" });
  const file = new File([blob], "invoice.xml", { type: "application/xml" });

  const pdfBlob = await generateInvoice(file, additionalData, "blob");
  const buf = await pdfBlob.arrayBuffer();
  return new Uint8Array(buf);
};

