import type { PDFDocumentProxy } from "pdfjs-dist";

export async function extractTextFromPdfDoc(pdfDoc: PDFDocumentProxy): Promise<string> {
  const totalPages = pdfDoc.numPages;
  let fullText = "";

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    
    let pageText = "";
    let lastY: number | undefined = undefined;

    for (const item of textContent.items) {
      if (!("str" in item)) continue;

      const y = item.transform[5];
      const height = item.height;

      // If there is a significant vertical jump, add a newline
      if (lastY !== undefined && Math.abs(lastY - y) > height * 0.5) {
        pageText += "\n";
      }
      
      pageText += item.str;

      if (item.hasEOL) {
        pageText += "\n";
        lastY = undefined; // Reset for next item so we don't double newline
      } else {
        lastY = y;
      }
    }

    fullText += pageText + "\n\n"; // Double newline between pages
    page.cleanup();
  }

  return fullText.trim();
}
