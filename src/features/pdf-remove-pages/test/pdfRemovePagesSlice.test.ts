import { afterAll, describe, expect, it } from 'vitest'
import { createTestStore, makePdfFile, readPdf } from '@/test/fixtures'
import {
    clearAll,
    fileSelected,
    pageToggled,
    pagesReplaced,
    removePages
} from '../pdfRemovePagesSlice'
import pdfRemovePagesReducer from '../pdfRemovePagesSlice'

describe('pdfRemovePagesSlice reducers', () => {
    it('marks a page for removal via pageToggled', () => {
        const state = pdfRemovePagesReducer(undefined, {
            type: pageToggled.type,
            payload: 2
        })
        expect(state.pagesToRemove).toEqual([2])
    })

    it('unmarks a previously marked page via pageToggled', () => {
        let state = pdfRemovePagesReducer(undefined, {
            type: pageToggled.type,
            payload: 2
        })
        state = pdfRemovePagesReducer(state, {
            type: pageToggled.type,
            payload: 2
        })
        expect(state.pagesToRemove).toEqual([])
    })

    it('tracks multiple marked pages', () => {
        let state = pdfRemovePagesReducer(undefined, {
            type: pageToggled.type,
            payload: 1
        })
        state = pdfRemovePagesReducer(state, {
            type: pageToggled.type,
            payload: 3
        })
        expect([...state.pagesToRemove].sort()).toEqual([1, 3])
    })

    it('replaces the marked pages via pagesReplaced', () => {
        const state = pdfRemovePagesReducer(undefined, {
            type: pagesReplaced.type,
            payload: [1, 2, 5]
        })
        expect(state.pagesToRemove).toEqual([1, 2, 5])
    })

    it('resets the marked pages when a new file is selected', () => {
        let state = pdfRemovePagesReducer(undefined, {
            type: pageToggled.type,
            payload: 1
        })
        state = pdfRemovePagesReducer(state, {
            type: fileSelected.type,
            payload: { id: '2', file: new File(['y'], 'b.pdf') }
        })
        expect(state.item?.id).toBe('2')
        expect(state.pagesToRemove).toEqual([])
    })

    it('clears everything via clearAll', () => {
        let state = pdfRemovePagesReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file: new File(['x'], 'a.pdf') }
        })
        state = pdfRemovePagesReducer(state, {
            type: pageToggled.type,
            payload: 1
        })
        state = pdfRemovePagesReducer(state, {
            type: clearAll.type,
            payload: undefined
        })
        expect(state.item).toBeNull()
        expect(state.pagesToRemove).toEqual([])
        expect(state.resultUrl).toBeNull()
    })
})

describe('removePages thunk', () => {
    it('removes the marked pages from the result', async () => {
        const store = createTestStore({ pdfRemovePages: pdfRemovePagesReducer })
        const file = await makePdfFile('source.pdf', 4)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(pagesReplaced([2, 3]))

        const result = await store.dispatch(removePages())
        expect(result.type).toBe('pdfRemovePages/removePages/fulfilled')

        const url = store.getState().pdfRemovePages.resultUrl
        expect(url).not.toBeNull()
        const output = await readPdf(url!)
        expect(output.getPageCount()).toBe(2)
    })

    it('keeps all pages when nothing is marked', async () => {
        const store = createTestStore({ pdfRemovePages: pdfRemovePagesReducer })
        const file = await makePdfFile('source.pdf', 3)
        store.dispatch(fileSelected({ id: '1', file }))

        await store.dispatch(removePages())

        const output = await readPdf(store.getState().pdfRemovePages.resultUrl!)
        expect(output.getPageCount()).toBe(3)
    })

    it('rejects when no file is selected', async () => {
        const store = createTestStore({ pdfRemovePages: pdfRemovePagesReducer })
        const result = await store.dispatch(removePages())
        expect(result.type).toBe('pdfRemovePages/removePages/rejected')
    })

    it('toggles isProcessing around the removal', async () => {
        const store = createTestStore({ pdfRemovePages: pdfRemovePagesReducer })
        const file = await makePdfFile('source.pdf', 2)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(pageToggled(1))

        const dispatch = store.dispatch(removePages())
        expect(store.getState().pdfRemovePages.isProcessing).toBe(true)
        await dispatch
        expect(store.getState().pdfRemovePages.isProcessing).toBe(false)
    })
})
