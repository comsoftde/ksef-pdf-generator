import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

export function setupPdfMakeFonts(): void {
  // vfs może siedzieć w różnych miejscach zależnie od bundlera/ESM
  const anyFonts: any = pdfFonts as any;

  const vfs =
    anyFonts?.pdfMake?.vfs ??
    anyFonts?.vfs ??
    anyFonts?.default?.pdfMake?.vfs ??
    anyFonts?.default?.vfs;

  if (!vfs) {
    // pomocniczo: pokaż co realnie przyszło w module (do debug)
    // eslint-disable-next-line no-console
    console.error("pdfFonts module keys:", Object.keys(anyFonts));
    // eslint-disable-next-line no-console
    console.error("pdfFonts.default keys:", anyFonts?.default ? Object.keys(anyFonts.default) : null);

    throw new Error("pdfmake vfs not found (vfs_fonts import mismatch)");
  }

  (pdfMake as any).vfs = vfs;

  (pdfMake as any).fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };
}
