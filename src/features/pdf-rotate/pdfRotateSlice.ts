import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import { degrees } from 'pdf-lib'
import {
    loadPdf,
    pdfToBlobUrl,
    type RotationAngle
} from '@/features/pdf-tools/lib/pdf'

export interface PdfRotateItem {
    id: string
    file: File
}

interface PdfRotateState {
    item: PdfRotateItem | null
    /** 1-based page number → total rotation in degrees (0/90/180/270). */
    rotations: Record<number, RotationAngle>
    resultUrl: string | null
    isProcessing: boolean
}

const initialState: PdfRotateState = {
    item: null,
    rotations: {},
    resultUrl: null,
    isProcessing: false
}

/**
 * Applies the stored per-page rotations and returns a blob URL of the result.
 */
export const rotatePdf = createAsyncThunk<string, void, { state: RootState }>(
    'pdfRotate/rotatePdf',
    async (_, { getState }) => {
        const { item, rotations } = getState().pdfRotate
        if (!item) throw new Error('No file selected.')

        const pdf = await loadPdf(item.file)
        for (const [pageKey, rotationAngle] of Object.entries(rotations)) {
            // `rotations` keys are 1-based page numbers; pdf-lib is 0-based.
            pdf.getPage(Number(pageKey) - 1).setRotation(degrees(rotationAngle))
        }
        return pdfToBlobUrl(pdf)
    }
)

const pdfRotateSlice = createSlice({
    name: 'pdfRotate',
    initialState,
    reducers: {
        fileSelected(state, action: PayloadAction<PdfRotateItem>) {
            state.item = action.payload
            state.rotations = {}
            state.resultUrl = null
        },
        rotationSet(
            state,
            action: PayloadAction<{ page: number; degrees: RotationAngle }>
        ) {
            state.rotations[action.payload.page] = action.payload.degrees
        },
        rotateAllPages(
            state,
            action: PayloadAction<{ by: RotationAngle; pageCount: number }>
        ) {
            const { by, pageCount } = action.payload
            for (let page = 1; page <= pageCount; page++) {
                const current = state.rotations[page] ?? 0
                state.rotations[page] =
                    ((current + by) % 360) as RotationAngle
            }
        },
        resetRotations(state) {
            state.rotations = {}
        },
        clearAll(state) {
            state.item = null
            state.rotations = {}
            state.resultUrl = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(rotatePdf.pending, (state) => {
                state.isProcessing = true
            })
            .addCase(rotatePdf.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrl = action.payload
            })
            .addCase(rotatePdf.rejected, (state) => {
                state.isProcessing = false
            })
    }
})

export const { fileSelected, rotationSet, rotateAllPages, resetRotations, clearAll } =
    pdfRotateSlice.actions

export const selectRotateItem = (state: RootState) => state.pdfRotate.item
export const selectRotations = (state: RootState) =>
    state.pdfRotate.rotations
export const selectRotateResultUrl = (state: RootState) =>
    state.pdfRotate.resultUrl
export const selectRotateIsProcessing = (state: RootState) =>
    state.pdfRotate.isProcessing

export default pdfRotateSlice.reducer
