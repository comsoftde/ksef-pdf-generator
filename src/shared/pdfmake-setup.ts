import pdfMake from "pdfmake/build/pdfmake";
import fontUrl from "../assets/fonts/NotoSans-Regular.ttf?url";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function setupPdfMakeFonts(): Promise<void> {
  const res = await fetch(fontUrl);
  const buf = await res.arrayBuffer();

  const base64 = arrayBufferToBase64(buf);

  (pdfMake as any).vfs = {
    "NotoSans-Regular.ttf": base64,
  };

  (pdfMake as any).fonts = {
    Noto: {
      normal: "NotoSans-Regular.ttf",
      bold: "NotoSans-Regular.ttf",
      italics: "NotoSans-Regular.ttf",
      bolditalics: "NotoSans-Regular.ttf",
    },
  };
}
