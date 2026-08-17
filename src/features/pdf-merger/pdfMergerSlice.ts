import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import { PDFDocument } from 'pdf-lib'
import type { RootState } from '@/store/store'

export interface PdfItem {
    id: string
    file: File
}

interface PdfMergerState {
    items: PdfItem[]
    mergedPdfUrl: string | null
    isMerging: boolean
}

const initialState: PdfMergerState = {
    items: [],
    mergedPdfUrl: null,
    isMerging: false
}

/**
 * Merges all selected PDFs client-side using pdf-lib and returns a blob URL.
 */
export const mergePdfs = createAsyncThunk<string, void, { state: RootState }>(
    'pdfMerger/mergePdfs',
    async (_, { getState }) => {
        const { items } = getState().pdfMerger

        if (items.length < 2) {
            throw new Error('Please add at least 2 PDF files to merge.')
        }

        const mergedPdf = await PDFDocument.create()

        for (const { file } of items) {
            const arrayBuffer = await file.arrayBuffer()
            const pdf = await PDFDocument.load(arrayBuffer)
            const copiedPages = await mergedPdf.copyPages(
                pdf,
                pdf.getPageIndices()
            )
            copiedPages.forEach((page) => mergedPdf.addPage(page))
        }

        const mergedPdfBytes = await mergedPdf.save()
        const blob = new Blob([mergedPdfBytes.buffer as ArrayBuffer], {
            type: 'application/pdf'
        })
        return URL.createObjectURL(blob)
    }
)

const pdfMergerSlice = createSlice({
    name: 'pdfMerger',
    initialState,
    reducers: {
        filesAdded(state, action: PayloadAction<PdfItem[]>) {
            state.items.push(...action.payload)
            state.mergedPdfUrl = null
        },
        fileRemoved(state, action: PayloadAction<number>) {
            state.items.splice(action.payload, 1)
            state.mergedPdfUrl = null
        },
        clearItems(state) {
            state.items = []
            state.mergedPdfUrl = null
        },
        itemsReplaced(state, action: PayloadAction<PdfItem[]>) {
            state.items = action.payload
            state.mergedPdfUrl = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(mergePdfs.pending, (state) => {
                state.isMerging = true
            })
            .addCase(mergePdfs.fulfilled, (state, action) => {
                state.isMerging = false
                state.mergedPdfUrl = action.payload
            })
            .addCase(mergePdfs.rejected, (state) => {
                state.isMerging = false
            })
    }
})

export const { filesAdded, fileRemoved, clearItems, itemsReplaced } =
    pdfMergerSlice.actions

export const selectItems = (state: RootState) => state.pdfMerger.items
export const selectMergedPdfUrl = (state: RootState) =>
    state.pdfMerger.mergedPdfUrl
export const selectIsMerging = (state: RootState) => state.pdfMerger.isMerging

export default pdfMergerSlice.reducer
