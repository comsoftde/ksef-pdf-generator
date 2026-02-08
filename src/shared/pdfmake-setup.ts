import pdfMake from "pdfmake/build/pdfmake";

export function setupPdfMakeFonts(): void {
  // Po `import "pdfmake/build/vfs_fonts"` VFS powinien być już w pdfMake.vfs
  const vfs = (pdfMake as any).vfs;

  if (!vfs || Object.keys(vfs).length === 0) {
    throw new Error("pdfmake vfs is empty - ensure import 'pdfmake/build/vfs_fonts' is executed in entrypoint");
  }

  (pdfMake as any).fonts = {
    Roboto: {
      normal: "Roboto-Regular.ttf",
      bold: "Roboto-Medium.ttf",
      italics: "Roboto-Italic.ttf",
      bolditalics: "Roboto-MediumItalic.ttf",
    },
  };
}
