import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AsciiResult } from './lib/imageAscii'

export interface AsciiState {
  item: { file: File; previewUrl: string } | null
  result: AsciiResult | null
  progress: number
  isProcessing: boolean
}

const initialState: AsciiState = { item: null, result: null, progress: 0, isProcessing: false }

const asciiSlice = createSlice({
  name: 'imageAscii',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = action.payload
      state.result = null
      state.progress = 0
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<AsciiResult>) { state.result = action.payload; state.isProcessing = false; state.progress = 100 },
    progressSet(state, action: PayloadAction<number>) { state.progress = action.payload },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, progressSet, processingSet, clearAll } = asciiSlice.actions
export default asciiSlice.reducer
