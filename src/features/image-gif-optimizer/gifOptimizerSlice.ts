import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OptimizeResult } from './lib/imageGifOptimizer'

export interface GifOptimizerState {
  item: { file: File; previewUrl: string } | null
  dimensions: { width: number; height: number } | null
  format: string
  quality: number
  result: OptimizeResult | null
  isProcessing: boolean
}

const initialState: GifOptimizerState = {
  item: null,
  dimensions: null,
  format: 'image/gif',
  quality: 0.9,
  result: null,
  isProcessing: false,
}

const gifOptimizerSlice = createSlice({
  name: 'imageGifOptimizer',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dimensions: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dimensions = action.payload.dimensions
      state.result = null
      state.isProcessing = false
    },
    formatSet(state, action: PayloadAction<string>) {
      state.format = action.payload
    },
    qualitySet(state, action: PayloadAction<number>) {
      state.quality = action.payload
    },
    resultSet(state, action: PayloadAction<OptimizeResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  formatSet,
  qualitySet,
  resultSet,
  processingSet,
  clearAll,
} = gifOptimizerSlice.actions

export default gifOptimizerSlice.reducer