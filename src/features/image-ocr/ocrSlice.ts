import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OcrResult } from './lib/imageOcr'

export interface OcrState {
  item: { file: File; previewUrl: string } | null
  result: OcrResult | null
  status: string
  progress: number
  isProcessing: boolean
}

const initialState: OcrState = { item: null, result: null, status: '', progress: 0, isProcessing: false }

const ocrSlice = createSlice({
  name: 'imageOcr',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = action.payload
      state.result = null
      state.status = ''
      state.progress = 0
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<OcrResult>) { state.result = action.payload; state.isProcessing = false; state.progress = 100; state.status = 'Done' },
    statusSet(state, action: PayloadAction<{ status: string; progress: number }>) { state.status = action.payload.status; state.progress = action.payload.progress },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, statusSet, processingSet, clearAll } = ocrSlice.actions
export default ocrSlice.reducer
