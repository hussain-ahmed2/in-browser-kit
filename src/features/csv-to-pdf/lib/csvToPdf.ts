import Papa from 'papaparse'
import { PDFDocument, rgb } from 'pdf-lib'

/**
 * Convert CSV text to a PDF table using papaparse + pdf-lib.
 */
export async function convertCsvToPdf(
  csvText: string,
  pageSize: 'a4' | 'letter' = 'a4'
): Promise<Blob> {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  const headers = parsed.meta.fields ?? []
  const rows = parsed.data as Record<string, string>[]

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont('Helvetica')
  const boldFont = await pdfDoc.embedFont('Helvetica-Bold')

  const pageWidth = pageSize === 'a4' ? 595.28 : 612
  const pageHeight = pageSize === 'a4' ? 841.89 : 792
  const margin = 40
  const usableWidth = pageWidth - margin * 2
  const colWidth = usableWidth / Math.max(headers.length, 1)
  const fontSize = 8
  const headerFontSize = 9
  const rowHeight = 18
  const headerHeight = 22

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  // Draw header
  const drawHeader = () => {
    y -= headerHeight
    headers.forEach((header, i) => {
      const x = margin + i * colWidth
      currentPage.drawRectangle({
        x,
        y,
        width: colWidth,
        height: headerHeight,
        color: rgb(0.92, 0.92, 0.92),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 0.5,
      })
      const text = header.substring(0, Math.floor(colWidth / (headerFontSize * 0.5)))
      currentPage.drawText(text, {
        x: x + 4,
        y: y + 6,
        size: headerFontSize,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      })
    })
  }

  drawHeader()

  // Draw rows
  for (const row of rows) {
    if (y - rowHeight < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
      drawHeader()
    }

    y -= rowHeight
    headers.forEach((header, i) => {
      const x = margin + i * colWidth
      currentPage.drawRectangle({
        x,
        y,
        width: colWidth,
        height: rowHeight,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 0.5,
      })
      const value = String(row[header] ?? '')
      const text = value.substring(0, Math.floor(colWidth / (fontSize * 0.5)))
      currentPage.drawText(text, {
        x: x + 4,
        y: y + 4,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      })
    })
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
}
