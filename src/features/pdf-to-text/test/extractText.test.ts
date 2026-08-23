import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { extractTextFromPdfDoc } from '../lib/extractText';

async function createTestPdfBytes(): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText('Hello World!', { x: 50, y: 700, size: 20 });
  page.drawText('This is a test document.', { x: 50, y: 650, size: 20 });
  page.drawText('Extract me please.', { x: 50, y: 600, size: 20 });
  return await pdfDoc.save();
}

describe('PDF to Text Extractor', () => {
  it('should extract text correctly with newlines', async () => {
    const data = await createTestPdfBytes();
    
    // Load using the legacy build for Node.js environment
    const loadingTask = pdfjsLib.getDocument({ data });
    const doc = await loadingTask.promise;
    
    const text = await extractTextFromPdfDoc(doc);
    
    console.log("EXTRACTED TEXT:");
    console.log(text);
    
    expect(text).toContain('Hello World!');
    expect(text).toContain('This is a test document.');
    expect(text).toContain('Extract me please.');
  });
});
