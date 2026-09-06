import mammoth from 'mammoth'
import { PDFDocument, rgb } from 'pdf-lib'

/**
 * Convert a DOCX file to PDF using mammoth (HTML extraction) + pdf-lib (PDF creation).
 */
export async function convertDocxToPdf(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()

  // Step 1: Extract HTML from DOCX
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const html = result.value

  // Step 2: Strip HTML tags to get plain text (for pdf-lib which only supports text)
  const plainText = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // Step 3: Create PDF with text content
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont('Helvetica')

  const pageSize = { width: 595.28, height: 841.89 } // A4
  const margin = 60
  const maxWidth = pageSize.width - margin * 2
  const fontSize = 11
  const lineHeight = fontSize * 1.5
  const linesPerPage = Math.floor((pageSize.height - margin * 2) / lineHeight)

  const paragraphs = plainText.split('\n')
  let currentPage = pdfDoc.addPage([pageSize.width, pageSize.height])
  let y = pageSize.height - margin
  let lineCount = 0

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      y -= lineHeight
      lineCount++
      if (lineCount >= linesPerPage) {
        currentPage = pdfDoc.addPage([pageSize.width, pageSize.height])
        y = pageSize.height - margin
        lineCount = 0
      }
      continue
    }

    // Word-wrap long lines
    const words = paragraph.split(' ')
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      const textWidth = font.widthOfTextAtSize(testLine, fontSize)

      if (textWidth > maxWidth && currentLine) {
        currentPage.drawText(currentLine, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0.1, 0.1, 0.1),
        })
        currentLine = word
        y -= lineHeight
        lineCount++

        if (lineCount >= linesPerPage) {
          currentPage = pdfDoc.addPage([pageSize.width, pageSize.height])
          y = pageSize.height - margin
          lineCount = 0
        }
      } else {
        currentLine = testLine
      }
    }

    if (currentLine) {
      currentPage.drawText(currentLine, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      })
      y -= lineHeight
      lineCount++

      if (lineCount >= linesPerPage) {
        currentPage = pdfDoc.addPage([pageSize.width, pageSize.height])
        y = pageSize.height - margin
        lineCount = 0
      }
    }
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
}
