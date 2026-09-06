import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { extractMarkdownFromPdf } from '../lib/extractMarkdown'

async function createTestPdfBytes(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  page.drawText('Hello World!', { x: 50, y: 700, size: 24 })
  page.drawText('This is a test document for markdown extraction.', { x: 50, y: 650, size: 12 })
  return await pdfDoc.save()
}

describe('PDF to Markdown Extractor', () => {
  it('extracts text as markdown from PDF', async () => {
    const data = await createTestPdfBytes()
    const loadingTask = pdfjsLib.getDocument({ data })
    const doc = await loadingTask.promise

    const markdown = await extractMarkdownFromPdf(doc)

    expect(markdown).toContain('Hello World!')
    expect(markdown).toContain('test document')
  })

  it('exports extractMarkdownFromPdf function', () => {
    expect(typeof extractMarkdownFromPdf).toBe('function')
  })
})
