import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import { PDFDocument } from 'pdf-lib'
import type { RootState } from '@/store/store'
import { loadPdf, pdfToBlobUrl } from '@/features/pdf-tools/lib/pdf'

export interface PdfRemovePagesItem {
    id: string
    file: File
}

interface PdfRemovePagesState {
    item: PdfRemovePagesItem | null
    /** 1-based page numbers marked for removal. */
    pagesToRemove: number[]
    resultUrl: string | null
    isProcessing: boolean
}

const initialState: PdfRemovePagesState = {
    item: null,
    pagesToRemove: [],
    resultUrl: null,
    isProcessing: false
}

/**
 * Removes the marked pages and returns a blob URL of the resulting PDF.
 */
export const removePages = createAsyncThunk<
    string,
    void,
    { state: RootState }
>('pdfRemovePages/removePages', async (_, { getState }) => {
    const { item, pagesToRemove } = getState().pdfRemovePages
    if (!item) throw new Error('No file selected.')

    const source = await loadPdf(item.file)
    const indicesToKeep = source
        .getPageIndices()
        .filter((index) => !pagesToRemove.includes(index + 1))

    const output = await PDFDocument.create()
    const copied = await output.copyPages(source, indicesToKeep)
    copied.forEach((page) => output.addPage(page))
    return pdfToBlobUrl(output)
})

const pdfRemovePagesSlice = createSlice({
    name: 'pdfRemovePages',
    initialState,
    reducers: {
        fileSelected(state, action: PayloadAction<PdfRemovePagesItem>) {
            state.item = action.payload
            state.pagesToRemove = []
            state.resultUrl = null
        },
        pageToggled(state, action: PayloadAction<number>) {
            const page = action.payload
            state.pagesToRemove = state.pagesToRemove.includes(page)
                ? state.pagesToRemove.filter((p) => p !== page)
                : [...state.pagesToRemove, page]
        },
        pagesReplaced(state, action: PayloadAction<number[]>) {
            state.pagesToRemove = action.payload
        },
        clearAll(state) {
            state.item = null
            state.pagesToRemove = []
            state.resultUrl = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(removePages.pending, (state) => {
                state.isProcessing = true
            })
            .addCase(removePages.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrl = action.payload
            })
            .addCase(removePages.rejected, (state) => {
                state.isProcessing = false
            })
    }
})

export const { fileSelected, pageToggled, pagesReplaced, clearAll } =
    pdfRemovePagesSlice.actions

export const selectRemoveItem = (state: RootState) =>
    state.pdfRemovePages.item
export const selectPagesToRemove = (state: RootState) =>
    state.pdfRemovePages.pagesToRemove
export const selectRemoveResultUrl = (state: RootState) =>
    state.pdfRemovePages.resultUrl
export const selectRemoveIsProcessing = (state: RootState) =>
    state.pdfRemovePages.isProcessing

export default pdfRemovePagesSlice.reducer
