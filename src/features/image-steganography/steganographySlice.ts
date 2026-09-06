import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { StegEncodeResult, StegDecodeResult } from './types'

export interface SteganographyState {
  item: { file: File; previewUrl: string } | null
  encodeResult: StegEncodeResult | null
  decodeResult: StegDecodeResult | null
  progress: number
  isProcessing: boolean
}

const initialState: SteganographyState = { item: null, encodeResult: null, decodeResult: null, progress: 0, isProcessing: false }

const steganographySlice = createSlice({
  name: 'imageSteganography',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = action.payload
      state.encodeResult = null
      state.decodeResult = null
      state.progress = 0
      state.isProcessing = false
    },
    encodeResultSet(state, action: PayloadAction<StegEncodeResult>) { state.encodeResult = action.payload; state.isProcessing = false; state.progress = 100 },
    decodeResultSet(state, action: PayloadAction<StegDecodeResult>) { state.decodeResult = action.payload; state.isProcessing = false; state.progress = 100 },
    progressSet(state, action: PayloadAction<number>) { state.progress = action.payload },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.encodeResult?.objectUrl) URL.revokeObjectURL(state.encodeResult.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, encodeResultSet, decodeResultSet, progressSet, processingSet, clearAll } = steganographySlice.actions
export default steganographySlice.reducer
