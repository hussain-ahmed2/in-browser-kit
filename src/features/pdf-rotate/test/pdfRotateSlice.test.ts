import { afterAll, describe, expect, it } from 'vitest'
import { createTestStore, makePdfFile, readPdf } from '@/test/fixtures'
import {
    clearAll,
    fileSelected,
    resetRotations,
    rotateAllPages,
    rotatePdf,
    rotationSet
} from '../pdfRotateSlice'
import pdfRotateReducer from '../pdfRotateSlice'

describe('pdfRotateSlice reducers', () => {
    it('stores a per-page rotation via rotationSet', () => {
        const state = pdfRotateReducer(undefined, {
            type: rotationSet.type,
            payload: { page: 2, degrees: 90 }
        })
        expect(state.rotations).toEqual({ 2: 90 })
    })

    it('accumulates rotations for distinct pages', () => {
        let state = pdfRotateReducer(undefined, {
            type: rotationSet.type,
            payload: { page: 1, degrees: 90 }
        })
        state = pdfRotateReducer(state, {
            type: rotationSet.type,
            payload: { page: 3, degrees: 270 }
        })
        expect(state.rotations).toEqual({ 1: 90, 3: 270 })
    })

    it('rotates every page by a fixed amount via rotateAllPages', () => {
        let state = pdfRotateReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file: new File(['x'], 'a.pdf') }
        })
        state = pdfRotateReducer(state, {
            type: rotateAllPages.type,
            payload: { by: 90, pageCount: 3 }
        })
        expect(state.rotations).toEqual({ 1: 90, 2: 90, 3: 90 })
    })

    it('wraps rotation totals back into 0/90/180/270', () => {
        let state = pdfRotateReducer(undefined, {
            type: rotationSet.type,
            payload: { page: 1, degrees: 180 }
        })
        state = pdfRotateReducer(state, {
            type: rotateAllPages.type,
            payload: { by: 180, pageCount: 1 }
        })
        expect(state.rotations).toEqual({ 1: 0 })
    })

    it('clears rotations via resetRotations', () => {
        let state = pdfRotateReducer(undefined, {
            type: rotationSet.type,
            payload: { page: 1, degrees: 90 }
        })
        state = pdfRotateReducer(state, {
            type: resetRotations.type,
            payload: undefined
        })
        expect(state.rotations).toEqual({})
    })

    it('resets state when a new file is selected', () => {
        let state = pdfRotateReducer(undefined, {
            type: rotationSet.type,
            payload: { page: 1, degrees: 90 }
        })
        state = pdfRotateReducer(state, {
            type: fileSelected.type,
            payload: { id: '2', file: new File(['y'], 'b.pdf') }
        })
        expect(state.item?.id).toBe('2')
        expect(state.rotations).toEqual({})
    })

    it('clears everything via clearAll', () => {
        let state = pdfRotateReducer(undefined, {
            type: fileSelected.type,
            payload: { id: '1', file: new File(['x'], 'a.pdf') }
        })
        state = pdfRotateReducer(state, {
            type: rotationSet.type,
            payload: { page: 1, degrees: 90 }
        })
        state = pdfRotateReducer(state, {
            type: clearAll.type,
            payload: undefined
        })
        expect(state.item).toBeNull()
        expect(state.rotations).toEqual({})
        expect(state.resultUrl).toBeNull()
    })
})

describe('rotatePdf thunk', () => {
    it('applies a 180° rotation to a page (regression)', async () => {
        const store = createTestStore({ pdfRotate: pdfRotateReducer })
        const file = await makePdfFile('rotate.pdf', 1)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(rotationSet({ page: 1, degrees: 180 }))

        const result = await store.dispatch(rotatePdf())
        expect(result.type).toBe('pdfRotate/rotatePdf/fulfilled')

        const url = store.getState().pdfRotate.resultUrl
        expect(url).not.toBeNull()
        const rotated = await readPdf(url!)
        expect(rotated.getPageCount()).toBe(1)
        expect(rotated.getPage(0).getRotation().angle).toBe(180)
    })

    it('applies each per-page rotation independently', async () => {
        const store = createTestStore({ pdfRotate: pdfRotateReducer })
        const file = await makePdfFile('rotate.pdf', 2)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(rotationSet({ page: 1, degrees: 90 }))
        store.dispatch(rotationSet({ page: 2, degrees: 270 }))

        const result = await store.dispatch(rotatePdf())
        expect(result.type).toBe('pdfRotate/rotatePdf/fulfilled')

        const rotated = await readPdf(store.getState().pdfRotate.resultUrl!)
        expect(rotated.getPage(0).getRotation().angle).toBe(90)
        expect(rotated.getPage(1).getRotation().angle).toBe(270)
    })

    it('rejects when no file is selected', async () => {
        const store = createTestStore({ pdfRotate: pdfRotateReducer })
        const result = await store.dispatch(rotatePdf())
        expect(result.type).toBe('pdfRotate/rotatePdf/rejected')
    })

    it('sets the result url on success', async () => {
        const store = createTestStore({ pdfRotate: pdfRotateReducer })
        const file = await makePdfFile('rotate.pdf', 1)
        store.dispatch(fileSelected({ id: '1', file }))
        store.dispatch(rotationSet({ page: 1, degrees: 90 }))

        await store.dispatch(rotatePdf())
        expect(store.getState().pdfRotate.resultUrl).toMatch(/^blob:/)
        expect(store.getState().pdfRotate.isProcessing).toBe(false)
    })
})
