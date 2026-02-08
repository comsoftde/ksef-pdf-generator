import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

export function setupPdfMakeFonts(): void {
  // W zależności od bundlera/exportu pdfmake, VFS bywa w różnych miejscach:
  const vfs =
    (pdfFonts as any)?.pdfMake?.vfs ??
    (pdfFonts as any)?.vfs;

  if (!vfs) {
    // Jeżeli tu trafisz, to znaczy że bundler wyciął VFS albo import jest inny.
    throw new Error("pdfmake vfs not found (vfs_fonts import mismatch)");
  }

  // @ts-expect-error - pdfMake.vfs nie zawsze jest w typach
  pdfMake.vfs = vfs;

  // Rejestracja fontów (nazwa rodziny: Roboto)
  (pdfMake as any).fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };
}
