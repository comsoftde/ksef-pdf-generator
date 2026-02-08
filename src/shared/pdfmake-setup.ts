import pdfMake from "pdfmake/build/pdfmake";

// Vite: import jako base64
import NotoSans from "../assets/fonts/NotoSans-Regular.ttf?base64";

export function setupPdfMakeFonts(): void {
  (pdfMake as any).vfs = {
    "NotoSans-Regular.ttf": NotoSans,
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
