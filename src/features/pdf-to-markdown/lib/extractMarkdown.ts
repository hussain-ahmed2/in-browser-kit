import type { PDFDocumentProxy } from 'pdfjs-dist'

/**
 * Extract text from a PDFDocumentProxy and format it as Markdown.
 */
export async function extractMarkdownFromPdf(pdfDoc: PDFDocumentProxy): Promise<string> {
  const totalPages = pdfDoc.numPages
  let fullMarkdown = ''

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i)
    const textContent = await page.getTextContent()

    let pageText = ''
    let lastY: number | undefined = undefined
    let lastFontSize = 0

    for (const item of textContent.items) {
      if (!('str' in item)) continue

      const y = item.transform[5]
      const height = item.height
      const fontSize = item.transform[0] || height

      // Detect heading-level text (larger font size)
      const isHeading = fontSize > 14 && fontSize > lastFontSize * 1.2
      const isNewParagraph = lastY !== undefined && Math.abs(lastY - y) > height * 0.8

      if (isNewParagraph) {
        pageText += '\n\n'
      } else if (lastY !== undefined && Math.abs(lastY - y) > height * 0.3) {
        pageText += '\n'
      }

      const text = item.str.trim()
      if (!text) continue

      if (isHeading && text.length < 100) {
        // Format as markdown heading based on relative size
        const level = fontSize > 20 ? 1 : fontSize > 16 ? 2 : 3
        pageText += `${'#'.repeat(level)} ${text}\n`
      } else {
        pageText += item.str
      }

      if (item.hasEOL) {
        pageText += '\n'
        lastY = undefined
      } else {
        lastY = y
      }

      lastFontSize = fontSize
    }

    // Clean up page text
    const cleanedPageText = pageText
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    if (cleanedPageText) {
      fullMarkdown += cleanedPageText + '\n\n---\n\n'
    }

    page.cleanup()
  }

  return fullMarkdown.replace(/\n---\n\n$/, '').trim()
}
