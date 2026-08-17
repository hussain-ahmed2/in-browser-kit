import { afterAll, describe, expect, it } from 'vitest'
import { createTestStore, makePdfFile, readPdf } from '@/test/fixtures'
import {
    clearItems,
    fileRemoved,
    filesAdded,
    itemsReplaced,
    mergePdfs
} from '../pdfMergerSlice'
import pdfMergerReducer from '../pdfMergerSlice'

describe('pdfMergerSlice reducers', () => {
    const item = (id: string, file: File) => ({ id, file })

    it('appends items via filesAdded and clears the result url', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const state = pdfMergerReducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file), item('2', file)]
        })
        expect(state.items).toHaveLength(2)
        expect(state.items[0].id).toBe('1')
    })

    it('removes an item by index via fileRemoved', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const seeded = pdfMergerReducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file), item('2', file), item('3', file)]
        })
        const state = pdfMergerReducer(seeded, {
            type: fileRemoved.type,
            payload: 1
        })
        expect(state.items.map((i) => i.id)).toEqual(['1', '3'])
    })

    it('replaces all items via itemsReplaced', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const state = pdfMergerReducer(undefined, {
            type: itemsReplaced.type,
            payload: [item('9', file)]
        })
        expect(state.items).toHaveLength(1)
        expect(state.items[0].id).toBe('9')
    })

    it('clears items and the result url via clearItems', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const seeded = pdfMergerReducer(undefined, {
            type: filesAdded.type,
            payload: [item('1', file)]
        })
        const state = pdfMergerReducer(seeded, {
            type: clearItems.type,
            payload: undefined
        })
        expect(state.items).toEqual([])
        expect(state.mergedPdfUrl).toBeNull()
    })

    it('resets the result url whenever items change', () => {
        const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
        const withResult = {
            ...pdfMergerReducer(undefined, {
                type: filesAdded.type,
                payload: [item('1', file)]
            }),
            mergedPdfUrl: 'blob:old'
        }
        const state = pdfMergerReducer(withResult, {
            type: filesAdded.type,
            payload: [item('2', file)]
        })
        expect(state.mergedPdfUrl).toBeNull()
    })
})

describe('mergePdfs thunk', () => {
    it('merges two PDFs into one with both page counts combined', async () => {
        const store = createTestStore({ pdfMerger: pdfMergerReducer })
        const pdfA = await makePdfFile('a.pdf', 2)
        const pdfB = await makePdfFile('b.pdf', 3)

        store.dispatch(
            filesAdded([
                { id: '1', file: pdfA },
                { id: '2', file: pdfB }
            ])
        )

        const result = await store.dispatch(mergePdfs())
        expect(result.type).toBe('pdfMerger/mergePdfs/fulfilled')

        const url = store.getState().pdfMerger.mergedPdfUrl
        expect(url).not.toBeNull()
        const merged = await readPdf(url!)
        expect(merged.getPageCount()).toBe(5)
    })

    it('rejects when fewer than two PDFs are selected', async () => {
        const store = createTestStore({ pdfMerger: pdfMergerReducer })
        const pdf = await makePdfFile('single.pdf', 1)
        store.dispatch(filesAdded([{ id: '1', file: pdf }]))

        const result = await store.dispatch(mergePdfs())
        expect(result.type).toBe('pdfMerger/mergePdfs/rejected')
        expect((result as { error?: { message: string } }).error?.message).toMatch(
            /at least 2/i
        )
    })

    it('toggles isProcessing around the merge', async () => {
        const store = createTestStore({ pdfMerger: pdfMergerReducer })
        const pdfA = await makePdfFile('a.pdf', 1)
        const pdfB = await makePdfFile('b.pdf', 1)
        store.dispatch(
            filesAdded([
                { id: '1', file: pdfA },
                { id: '2', file: pdfB }
            ])
        )

        const dispatch = store.dispatch(mergePdfs())
        expect(store.getState().pdfMerger.isMerging).toBe(true)
        await dispatch
        expect(store.getState().pdfMerger.isMerging).toBe(false)
    })
})
