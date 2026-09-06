import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HistogramData } from './lib/imageHistogram'

export interface HistogramState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  histogram: HistogramData | null
  isProcessing: boolean
}

const initialState: HistogramState = {
  item: null,
  dims: null,
  histogram: null,
  isProcessing: false,
}

const histogramSlice = createSlice({
  name: 'imageHistogram',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.histogram = null
      state.isProcessing = false
    },
    histogramSet(state, action: PayloadAction<HistogramData>) {
      state.histogram = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, histogramSet, processingSet, clearAll } = histogramSlice.actions
export default histogramSlice.reducer
