import { PDFDocument } from 'pdf-lib'

/** Valid pdf-lib rotation angles in degrees (always a multiple of 90). */
export type RotationAngle = 0 | 90 | 180 | 270

export async function loadPdf(file: File): Promise<PDFDocument> {
    const bytes = await file.arrayBuffer()
    return PDFDocument.load(bytes)
}

export async function pdfToBlobUrl(pdf: PDFDocument): Promise<string> {
    const bytes = await pdf.save()
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: 'application/pdf'
    })
    return URL.createObjectURL(blob)
}

/**
 * Parses page selections like "1,3,5-7" into a sorted list of 1-based page
 * numbers, clamped to the document's page count. Invalid parts are ignored.
 */
export function parsePageRanges(input: string, pageCount: number): number[] {
    const pages = new Set<number>()

    for (const part of input.split(',')) {
        const trimmed = part.trim()
        if (!trimmed) continue

        const range = trimmed.split('-')
        if (range.length === 1) {
            const page = Number(range[0])
            if (Number.isInteger(page) && page >= 1 && page <= pageCount) {
                pages.add(page)
            }
            continue
        }

        if (range.length === 2) {
            const start = Number(range[0])
            const end = Number(range[1])
            if (
                Number.isInteger(start) &&
                Number.isInteger(end) &&
                start >= 1 &&
                end >= start
            ) {
                for (let page = start; page <= Math.min(end, pageCount); page++) {
                    pages.add(page)
                }
            }
        }
    }

    return [...pages].sort((a, b) => a - b)
}
