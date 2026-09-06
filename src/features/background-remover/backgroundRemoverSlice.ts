import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BackgroundRemoverResult } from './lib/backgroundRemover'

export interface BackgroundRemoverState {
  item: { file: File; previewUrl: string } | null
  result: BackgroundRemoverResult | null
  status: string
  progress: number
  isProcessing: boolean
}

const initialState: BackgroundRemoverState = { item: null, result: null, status: '', progress: 0, isProcessing: false }

const backgroundRemoverSlice = createSlice({
  name: 'backgroundRemover',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.result = null
      state.status = ''
      state.progress = 0
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<BackgroundRemoverResult>) {
      state.result = action.payload
      state.isProcessing = false
      state.progress = 100
      state.status = 'Done'
    },
    statusSet(state, action: PayloadAction<{ status: string; progress: number }>) {
      state.status = action.payload.status
      state.progress = action.payload.progress
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

export const { fileSelected, resultSet, statusSet, processingSet, clearAll } = backgroundRemoverSlice.actions
export default backgroundRemoverSlice.reducer
