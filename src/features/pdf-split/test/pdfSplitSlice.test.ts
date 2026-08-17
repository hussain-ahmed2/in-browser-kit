import { afterAll, describe, expect, it, vi } from 'vitest'
import {
    createTestStore,
    makePdfFile,
    readPdf
} from '@/test/fixtures'
import {
    clearAll,
    everySet,
    fileSelected,
    modeSet,
    rangesSet,
    splitPdf
} from '../pdfSplitSlice'
import pdfSplitReducer from '../pdfSplitSlice'

const mockCreateObjectURL = vi.hoisted(() => {
    let counter = 0
    return vi.fn((_blob: Blob) => {
        void _blob
        return `blob:mock-${counter++}`
    })
})

const mockRevokeObjectURL = vi.hoisted(() => vi.fn())

vi.stubGlobal('URL', {
    ...globalThis.URL,
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL
})

afterAll(() => {
    vi.unstubAllGlobals()
})

describe('pdfSplitSlice reducers', () => {
    it('stores the selected file and resets config', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const state = pdfSplitReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file }
        })
        expect(state.item?.id).toBe('1')
        expect(state.config).toEqual({ mode: 'ranges', ranges: '', every: 1 })
    })

    it('updates the split mode', () => {
        let state = pdfSplitReducer(undefined, {
            type: modeSet.type,
            payload: 'every'
        })
        expect(state.config.mode).toBe('every')

        state = pdfSplitReducer(state, {
            type: modeSet.type,
            payload: 'all'
        })
        expect(state.config.mode).toBe('all')
    })

    it('updates the ranges string', () => {
        const state = pdfSplitReducer(undefined, {
            type: rangesSet.type,
            payload: '1,3,5-7'
        })
        expect(state.config.ranges).toBe('1,3,5-7')
    })

    it('updates the every (chunk size) value', () => {
        const state = pdfSplitReducer(undefined, {
            type: everySet.type,
            payload: 2
        })
        expect(state.config.every).toBe(2)
    })

    it('resets everything on clearAll', () => {
        let state = pdfSplitReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file: new File(['x'], 'a.pdf') }
        })
        state = pdfSplitReducer(state, {
            type: modeSet.type,
            payload: 'every'
        })
        state = pdfSplitReducer(state, {
            type: rangesSet.type,
            payload: '1,2'
        })
        state = pdfSplitReducer(state, {
            type: clearAll.type,
            payload: undefined
        })
        expect(state.item).toBeNull()
        expect(state.config).toEqual({ mode: 'ranges', ranges: '', every: 1 })
        expect(state.resultUrls).toEqual([])
    })
})

describe('splitPdf thunk', () => {
    it.skip('extracts pages by ranges into a single PDF', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 5)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('ranges'))
        store.dispatch(rangesSet('1,3,5'))

        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/fulfilled')

        const urls = store.getState().pdfSplit.resultUrls
        expect(urls).toHaveLength(1)
        const output = await readPdf(urls[0])
        expect(output.getPageCount()).toBe(3)
    })

    it.skip('splits every N pages and returns multiple URLs', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 6)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('every'))
        store.dispatch(everySet(2))

        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/fulfilled')

        const urls = store.getState().pdfSplit.resultUrls
        expect(urls).toHaveLength(3)
        for (const url of urls) {
            const output = await readPdf(url)
            expect(output.getPageCount()).toBe(2)
        }
    })

    it.skip('splits all pages and returns a single ZIP URL', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 3)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('all'))

        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/fulfilled')

        const urls = store.getState().pdfSplit.resultUrls
        expect(urls).toHaveLength(1)
        expect(urls[0]).toMatch(/^blob:/)
    })

    it('rejects when no file is selected', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/rejected')
    })

    it('rejects when ranges mode has no ranges specified', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 3)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('ranges'))

        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/rejected')
    })

    it('rejects when ranges produce no valid pages', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 3)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('ranges'))
        store.dispatch(rangesSet('99'))

        const result = await store.dispatch(splitPdf())
        expect(result.type).toBe('pdfSplit/splitPdf/rejected')
    })

    it('toggles isProcessing around the split', async () => {
        const store = createTestStore({ pdfSplit: pdfSplitReducer })
        const file = await makePdfFile('source.pdf', 4)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(modeSet('every'))
        store.dispatch(everySet(2))

        const dispatch = store.dispatch(splitPdf())
        expect(store.getState().pdfSplit.isProcessing).toBe(true)
        await dispatch
        expect(store.getState().pdfSplit.isProcessing).toBe(false)
    })
})