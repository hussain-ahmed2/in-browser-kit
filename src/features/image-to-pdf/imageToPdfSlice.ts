import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import {
    imagesToPdf,
    pdfBytesToBlobUrl,
    type ImageToPdfOptions
} from './lib/imageToPdf'

export interface ImageItem {
    id: string
    file: File
    /** Blob URL created on selection for rendering thumbnails. */
    previewUrl?: string
}

interface ImageToPdfState {
    items: ImageItem[]
    resultUrl: string | null
    isProcessing: boolean
}

const initialState: ImageToPdfState = {
    items: [],
    resultUrl: null,
    isProcessing: false
}

/**
 * Converts all selected images into a single PDF client-side and returns a
 * blob URL. Non-PNG/JPEG images are converted to PNG lazily via the browser
 * canvas helper only when present.
 */
export const convertImagesToPdf = createAsyncThunk<
    string,
    ImageToPdfOptions,
    { state: RootState }
>('imageToPdf/convertImagesToPdf', async (options, { getState }) => {
    const { items } = getState().imageToPdf

    if (items.length === 0) {
        throw new Error('No images selected.')
    }

    const { convertToPng } = await import('./lib/browserToPng')
    const bytes = await imagesToPdf(
        items.map((item) => item.file),
        options,
        convertToPng
    )
    return pdfBytesToBlobUrl(bytes)
})

const imageToPdfSlice = createSlice({
    name: 'imageToPdf',
    initialState,
    reducers: {
        filesAdded(state, action: PayloadAction<ImageItem[]>) {
            state.items.push(...action.payload)
            state.resultUrl = null
        },
        fileRemoved(state, action: PayloadAction<number>) {
            state.items.splice(action.payload, 1)
            state.resultUrl = null
        },
        clearItems(state) {
            state.items = []
            state.resultUrl = null
        },
        itemsReplaced(state, action: PayloadAction<ImageItem[]>) {
            state.items = action.payload
            state.resultUrl = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(convertImagesToPdf.pending, (state) => {
                state.isProcessing = true
            })
            .addCase(convertImagesToPdf.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrl = action.payload
            })
            .addCase(convertImagesToPdf.rejected, (state) => {
                state.isProcessing = false
            })
    }
})

export const { filesAdded, fileRemoved, clearItems, itemsReplaced } =
    imageToPdfSlice.actions

export const selectItems = (state: RootState) => state.imageToPdf.items
export const selectResultUrl = (state: RootState) =>
    state.imageToPdf.resultUrl
export const selectIsProcessing = (state: RootState) =>
    state.imageToPdf.isProcessing

export default imageToPdfSlice.reducer
