import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CompareResult } from './lib/imageComparator'

export interface ComparatorState {
  imageA: { file: File; previewUrl: string; dims: { width: number; height: number } } | null
  imageB: { file: File; previewUrl: string; dims: { width: number; height: number } } | null
  result: CompareResult | null
  isProcessing: boolean
}

const initialState: ComparatorState = {
  imageA: null,
  imageB: null,
  result: null,
  isProcessing: false,
}

const comparatorSlice = createSlice({
  name: 'imageComparator',
  initialState,
  reducers: {
    imageASelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.imageA = action.payload
      state.result = null
    },
    imageBSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.imageB = action.payload
      state.result = null
    },
    resultSet(state, action: PayloadAction<CompareResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.imageA?.previewUrl) URL.revokeObjectURL(state.imageA.previewUrl)
      if (state.imageB?.previewUrl) URL.revokeObjectURL(state.imageB.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { imageASelected, imageBSelected, resultSet, processingSet, clearAll } = comparatorSlice.actions
export default comparatorSlice.reducer
