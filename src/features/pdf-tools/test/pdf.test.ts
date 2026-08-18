import { describe, expect, it } from 'vitest'
import { makePdfFile, readPdf } from '@/test/fixtures'
import { loadPdf, parsePageRanges, pdfToBlobUrl } from '../lib/pdf'

describe('parsePageRanges', () => {
    it('parses a single page', () => {
        expect(parsePageRanges('3', 10)).toEqual([3])
    })

    it('parses a comma-separated list', () => {
        expect(parsePageRanges('1,4,2', 10)).toEqual([1, 2, 4])
    })

    it('expands ranges inclusively', () => {
        expect(parsePageRanges('2-5', 10)).toEqual([2, 3, 4, 5])
    })

    it('supports a mix of single pages and ranges', () => {
        expect(parsePageRanges('1,3-4,9', 10)).toEqual([1, 3, 4, 9])
    })

    it('clamps ranges to the page count', () => {
        expect(parsePageRanges('5-20', 8)).toEqual([5, 6, 7, 8])
        expect(parsePageRanges('8-10', 8)).toEqual([8])
    })

    it('ignores pages above the page count', () => {
        expect(parsePageRanges('11,12', 10)).toEqual([])
    })

    it('ignores invalid parts', () => {
        expect(parsePageRanges('0,abc,-1,3-', 10)).toEqual([])
        expect(parsePageRanges('', 10)).toEqual([])
        expect(parsePageRanges('  ', 10)).toEqual([])
    })

    it('ignores reversed ranges', () => {
        expect(parsePageRanges('5-3', 10)).toEqual([])
    })

    it('deduplicates repeated pages', () => {
        expect(parsePageRanges('2,2,2-3', 10)).toEqual([2, 3])
    })

    it('returns a sorted list', () => {
        expect(parsePageRanges('9,2,5-6,1', 10)).toEqual([1, 2, 5, 6, 9])
    })
})

describe('loadPdf', () => {
    it('loads a valid PDF file', async () => {
        const file = await makePdfFile('sample.pdf', 3)
        const pdf = await loadPdf(file)
        expect(pdf.getPageCount()).toBe(3)
    })

    it('rejects non-PDF input', async () => {
        const file = new File(['not a pdf'], 'fake.pdf', {
            type: 'application/pdf'
        })
        await expect(loadPdf(file)).rejects.toThrow()
    })
})

describe('pdfToBlobUrl', () => {
    it('produces a blob URL whose bytes parse back to the same page count', async () => {
        const source = await makePdfFile('source.pdf', 2)
        const pdf = await loadPdf(source)

        const url = await pdfToBlobUrl(pdf)
        expect(url).toMatch(/^blob:/)

        const reloaded = await readPdf(url)
        expect(reloaded.getPageCount()).toBe(2)
    })
})