import Papa from 'papaparse'
import { PDFDocument, rgb } from 'pdf-lib'

/**
 * Parse a CSV/XLSX file (CSV text) and convert to PDF table.
 */
export async function convertExcelToPdf(csvText: string): Promise<Blob> {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  const headers = parsed.meta.fields ?? []
  const rows = parsed.data as Record<string, string>[]

  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont('Helvetica')
  const boldFont = await pdfDoc.embedFont('Helvetica-Bold')

  const pageWidth = 595.28
  const pageHeight = 841.89
  const margin = 40
  const usableWidth = pageWidth - margin * 2
  const colWidth = usableWidth / Math.max(headers.length, 1)
  const fontSize = 8
  const headerFontSize = 9
  const rowHeight = 18
  const headerHeight = 22

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

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
