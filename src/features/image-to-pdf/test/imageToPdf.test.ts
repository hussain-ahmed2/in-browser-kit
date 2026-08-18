import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { createTestStore, makeJpegFile, makePngFile, readPdf } from '@/test/fixtures'
import reducer, {
    clearItems,
    convertImagesToPdf,
    fileRemoved,
    filesAdded,
    itemsReplaced,
    type ImageItem
} from '../imageToPdfSlice'
import {
    MAX_FIT_POINTS,
    computeContainDraw,
    embedImage,
    resolvePageSize,
    sniffImageFormat
} from '../lib/imageToPdf'

const item = (id: string, file: File): ImageItem => ({ id, file })

describe('imageToPdfSlice reducers', () => {
    it('appends items via filesAdded and clears the result url', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        const state = reducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file), item('2', file)]
        })
        expect(state.items).toHaveLength(2)
        expect(state.items[0].id).toBe('1')
    })

    it('removes an item by index via fileRemoved', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        const seeded = reducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file), item('2', file), item('3', file)]
        })
        const state = reducer(seeded, {
            type: fileRemoved.type,
            payload: 1
        })
        expect(state.items.map((i) => i.id)).toEqual(['1', '3'])
    })

    it('replaces all items via itemsReplaced', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        const state = reducer(undefined, {
            type: itemsReplaced.type,
            payload: [item('9', file)]
        })
        expect(state.items).toHaveLength(1)
        expect(state.items[0].id).toBe('9')
    })

    it('clears items and the result url via clearItems', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        const seeded = reducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file)]
        })
        const state = reducer(seeded, {
            type: clearItems.type,
            payload: undefined
        })
        expect(state.items).toEqual([])
        expect(state.resultUrl).toBeNull()
    })

    it('resets the result url whenever items change', () => {
        const file = new File(['x'], 'a.png', { type: 'image/png' })
        const withResult = {
            ...reducer(undefined, {
                type: filesAdded.type,
                payload: [item('1', file)]
            }),
            resultUrl: 'blob:old'
        }
        const state = reducer(withResult, {
            type: filesAdded.type,
            payload: [item('2', file)]
        })
        expect(state.resultUrl).toBeNull()
    })
})

describe('convertImagesToPdf thunk', () => {
    it('combines a PNG and a JPEG into one PDF with a page per image', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const png = await makePngFile('a.png', 100, 50)
        const jpg = await makeJpegFile('b.jpg', 200, 100)
        store.dispatch(
            filesAdded([
                { id: '1', file: png },
                { id: '2', file: jpg }
            ])
        )

        const result = await store.dispatch(
            convertImagesToPdf({ pageSize: 'fit', margin: 24 })
        )
        expect(result.type).toBe('imageToPdf/convertImagesToPdf/fulfilled')

        const url = store.getState().imageToPdf.resultUrl
        expect(url).not.toBeNull()
        const pdf = await readPdf(url!)
        expect(pdf.getPageCount()).toBe(2)
        const [first, second] = pdf.getPages()
        expect(first.getSize().width).toBe(148)
        expect(first.getSize().height).toBe(98)
        expect(second.getSize().width).toBe(248)
        expect(second.getSize().height).toBe(148)
    })

    it('caps fit pages to MAX_FIT_POINTS for a very wide image', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const wide = await makePngFile('wide.png', 4000, 100)
        store.dispatch(filesAdded([{ id: '1', file: wide }]))

        await store.dispatch(
            convertImagesToPdf({ pageSize: 'fit', margin: 24 })
        )

        const url = store.getState().imageToPdf.resultUrl
        const pdf = await readPdf(url!)
        const [page] = pdf.getPages()
        expect(page.getSize().width).toBe(MAX_FIT_POINTS)
        expect(page.getSize().height).toBeLessThan(MAX_FIT_POINTS)
    })

    it('caps fit pages to MAX_FIT_POINTS for a very tall image', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const tall = await makePngFile('tall.png', 100, 4000)
        store.dispatch(filesAdded([{ id: '1', file: tall }]))

        await store.dispatch(
            convertImagesToPdf({ pageSize: 'fit', margin: 24 })
        )

        const url = store.getState().imageToPdf.resultUrl
        const pdf = await readPdf(url!)
        const [page] = pdf.getPages()
        expect(page.getSize().height).toBe(MAX_FIT_POINTS)
        expect(page.getSize().width).toBeLessThan(MAX_FIT_POINTS)
    })

    it('uses letter page size with the configured margin', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const png = await makePngFile('a.png', 100, 50)
        store.dispatch(filesAdded([{ id: '1', file: png }]))

        await store.dispatch(
            convertImagesToPdf({ pageSize: 'letter', margin: 24 })
        )

        const url = store.getState().imageToPdf.resultUrl
        const pdf = await readPdf(url!)
        const [page] = pdf.getPages()
        expect(page.getSize().width).toBe(612)
        expect(page.getSize().height).toBe(792)
    })

    it('uses the selected fixed page size for every page', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const png = await makePngFile('a.png', 100, 50)
        store.dispatch(filesAdded([{ id: '1', file: png }]))

        await store.dispatch(
            convertImagesToPdf({ pageSize: 'a4', margin: 0 })
        )

        const url = store.getState().imageToPdf.resultUrl
        const pdf = await readPdf(url!)
        const [page] = pdf.getPages()
        expect(page.getSize().width).toBeCloseTo(595.28, 1)
        expect(page.getSize().height).toBeCloseTo(841.89, 1)
    })

    it('rejects when no images are selected', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const result = await store.dispatch(
            convertImagesToPdf({ pageSize: 'fit', margin: 24 })
        )
        expect(result.type).toBe('imageToPdf/convertImagesToPdf/rejected')
        expect((result as { error?: { message: string } }).error?.message).toMatch(
            /No images selected/i
        )
    })

    it('toggles isProcessing around the conversion', async () => {
        const store = createTestStore({ imageToPdf: reducer })
        const png = await makePngFile('a.png', 100, 50)
        store.dispatch(filesAdded([{ id: '1', file: png }]))

        const dispatch = store.dispatch(
            convertImagesToPdf({ pageSize: 'fit', margin: 24 })
        )
        expect(store.getState().imageToPdf.isProcessing).toBe(true)
        await dispatch
        expect(store.getState().imageToPdf.isProcessing).toBe(false)
    })
})

describe('sniffImageFormat', () => {
    it('detects PNG by its magic bytes', async () => {
        const png = await makePngFile('a.png')
        const bytes = new Uint8Array(await png.arrayBuffer())
        expect(sniffImageFormat(bytes)).toBe('png')
    })

    it('detects JPEG by its SOI marker', async () => {
        const jpg = await makeJpegFile('a.jpg')
        const bytes = new Uint8Array(await jpg.arrayBuffer())
        expect(sniffImageFormat(bytes)).toBe('jpeg')
    })

    it('classifies garbage and empty bytes as other', () => {
        expect(sniffImageFormat(new Uint8Array([1, 2, 3, 4]))).toBe('other')
        expect(sniffImageFormat(new Uint8Array(0))).toBe('other')
    })
})

describe('embedImage', () => {
    it('embeds a PNG even when the MIME type claims JPEG', async () => {
        const pdf = await PDFDocument.create()
        const png = await makePngFile('mislabeled.jpg', 60, 40)
        const mislabeled = new File([png], 'mislabeled.jpg', {
            type: 'image/jpeg'
        })

        const image = await embedImage(pdf, mislabeled, async () => {
            throw new Error('converter must not be called')
        })
        expect(image.width).toBe(60)
        expect(image.height).toBe(40)
    })

    it('routes unrecognized content through the converter', async () => {
        const pdf = await PDFDocument.create()
        const pngBytes = new Uint8Array(
            await (await makePngFile('fallback.png', 60, 40)).arrayBuffer()
        )
        const garbage = new File(['not an image'], 'x.jpg', {
            type: 'image/jpeg'
        })

        const image = await embedImage(pdf, garbage, async () => pngBytes)
        expect(image.width).toBe(60)
        expect(image.height).toBe(40)
    })
})

describe('resolvePageSize', () => {
    it('fit sizes the page as image plus margin on each side', () => {
        expect(resolvePageSize(100, 50, 'fit', 24)).toEqual([148, 98])
    })

    it('fit with zero margin matches the image dimensions exactly', () => {
        expect(resolvePageSize(100, 50, 'fit', 0)).toEqual([100, 50])
    })

    it('fit caps a very wide image at MAX_FIT_POINTS', () => {
        const [width, height] = resolvePageSize(4000, 100, 'fit', 24)
        expect(width).toBe(MAX_FIT_POINTS)
        expect(height).toBeLessThan(MAX_FIT_POINTS)
    })

    it('fit caps a very tall image at MAX_FIT_POINTS', () => {
        const [width, height] = resolvePageSize(100, 4000, 'fit', 24)
        expect(height).toBe(MAX_FIT_POINTS)
        expect(width).toBeLessThan(MAX_FIT_POINTS)
    })

    it('fit keeps small images unscaled regardless of margin', () => {
        expect(resolvePageSize(300, 200, 'fit', 40)).toEqual([380, 280])
    })

    it('fixed sizes ignore the margin when sizing the page', () => {
        expect(resolvePageSize(100, 50, 'a4', 40)).toEqual([595.28, 841.89])
        expect(resolvePageSize(4000, 100, 'letter', 24)).toEqual([612, 792])
    })
})

describe('computeContainDraw', () => {
    it('fit pages produce exactly the configured margin on every side', () => {
        const draw = computeContainDraw(100, 50, 148, 98, 24)
        expect(draw).toEqual({ x: 24, y: 24, width: 100, height: 50 })
    })

    it('zero margin fills the page completely', () => {
        const draw = computeContainDraw(100, 50, 100, 50, 0)
        expect(draw).toEqual({ x: 0, y: 0, width: 100, height: 50 })
    })

    it('capped wide image keeps the horizontal margin', () => {
        const draw = computeContainDraw(2000, 100, 1200, 106, 24)
        expect(draw.x).toBeCloseTo(24, 1)
        expect(draw.width).toBeCloseTo(1152, 0)
    })

    it('capped tall image keeps the vertical margin', () => {
        const draw = computeContainDraw(100, 2000, 106, 1200, 24)
        expect(draw.y).toBeCloseTo(24, 1)
        expect(draw.height).toBeCloseTo(1152, 0)
    })

    it('fixed page sizes center with at least the configured margin', () => {
        const draw = computeContainDraw(100, 50, 612, 792, 24)
        expect(draw.x).toBe(24)
        expect(draw.y).toBeGreaterThan(24)
    })
})
