import {
    createAsyncThunk,
    createSlice,
    type PayloadAction
} from '@reduxjs/toolkit'
import { PDFDocument } from 'pdf-lib'
import type { RootState } from '@/store/store'
import {
    loadPdf,
    pdfToBlobUrl,
    parsePageRanges
} from '@/features/pdf-tools/lib/pdf'

export interface PdfSplitItem {
    id: string
    file: File
}

export type SplitMode = 'ranges' | 'every' | 'all'

export interface SplitConfig {
    mode: SplitMode
    ranges: string
    every: number
}

interface PdfSplitState {
    item: PdfSplitItem | null
    config: SplitConfig
    resultUrls: string[]
    isProcessing: boolean
}

const initialConfig: SplitConfig = {
    mode: 'ranges',
    ranges: '',
    every: 1
}

const initialState: PdfSplitState = {
    item: null,
    config: initialConfig,
    resultUrls: [],
    isProcessing: false
}

/**
 * Splits the selected PDF according to the current config.
 * Returns an array of blob URLs (single URL for ranges mode, multiple for zip entries).
 */
export const splitPdf = createAsyncThunk<string[], void, { state: RootState }>(
    'pdfSplit/splitPdf',
    async (_, { getState }) => {
        const { item, config } = getState().pdfSplit
        if (!item) throw new Error('No file selected.')

        const pdf = await loadPdf(item.file)
        const pageCount = pdf.getPageCount()

        if (config.mode === 'ranges') {
            const pages = parsePageRanges(config.ranges, pageCount)
            if (pages.length === 0) {
                throw new Error('No valid pages selected.')
            }

            const output = await PDFDocument.create()
            const copied = await output.copyPages(pdf, pages.map((p) => p - 1))
            copied.forEach((page) => output.addPage(page))
            const url = await pdfToBlobUrl(output)
            return [url]
        }

        if (config.mode === 'every' || config.mode === 'all') {
            const chunkSize = config.mode === 'every' ? config.every : 1
            if (chunkSize < 1 || chunkSize > pageCount) {
                throw new Error('Invalid split size.')
            }

            const urls: string[] = []
            const JSZip = (await import('jszip')).default
            const zip = new JSZip()

            for (let start = 1; start <= pageCount; start += chunkSize) {
                const end = Math.min(start + chunkSize - 1, pageCount)
                const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i - 1)

                const output = await PDFDocument.create()
                const copied = await output.copyPages(pdf, pages.map((p) => p - 1))
                copied.forEach((page) => output.addPage(page))

                const bytes = await output.save()
                const filename = chunkSize === 1
                    ? `page-${start}.pdf`
                    : `pages-${start}-${end}.pdf`
                zip.file(filename, bytes)

                if (config.mode === 'every') {
                    const url = await pdfToBlobUrl(output)
                    urls.push(url)
                }
            }

            if (config.mode === 'every') {
                return urls
            }

            const blob = await zip.generateAsync({ type: 'blob' })
            const url = URL.createObjectURL(blob)
            return [url]
        }

        return []
    }
)

const pdfSplitSlice = createSlice({
    name: 'pdfSplit',
    initialState,
    reducers: {
        fileSelected(state, action: PayloadAction<PdfSplitItem>) {
            state.item = action.payload
            state.config = { ...initialConfig }
            state.resultUrls = []
        },
        modeSet(state, action: PayloadAction<SplitMode>) {
            state.config.mode = action.payload
        },
        rangesSet(state, action: PayloadAction<string>) {
            state.config.ranges = action.payload
        },
        everySet(state, action: PayloadAction<number>) {
            state.config.every = action.payload
        },
        clearAll(state) {
            state.item = null
            state.config = { ...initialConfig }
            state.resultUrls = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(splitPdf.pending, (state) => {
                state.isProcessing = true
            })
            .addCase(splitPdf.fulfilled, (state, action) => {
                state.isProcessing = false
                state.resultUrls = action.payload
            })
            .addCase(splitPdf.rejected, (state) => {
                state.isProcessing = false
            })
    }
})

export const { fileSelected, modeSet, rangesSet, everySet, clearAll } =
    pdfSplitSlice.actions

export const selectSplitItem = (state: RootState) => state.pdfSplit.item
export const selectSplitConfig = (state: RootState) => state.pdfSplit.config
export const selectSplitResultUrls = (state: RootState) =>
    state.pdfSplit.resultUrls
export const selectSplitIsProcessing = (state: RootState) =>
    state.pdfSplit.isProcessing

export default pdfSplitSlice.reducer