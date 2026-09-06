import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { UpscaleResult } from './lib/imageAiUpscaler'

export interface AiUpscalerState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  result: UpscaleResult | null
  status: string
  progress: number
  isProcessing: boolean
}

const initialState: AiUpscalerState = { item: null, dims: null, result: null, status: '', progress: 0, isProcessing: false }

const aiUpscalerSlice = createSlice({
  name: 'imageAiUpscaler',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.result = null
      state.status = ''
      state.progress = 0
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<UpscaleResult>) { state.result = action.payload; state.isProcessing = false; state.progress = 100; state.status = 'Done' },
    statusSet(state, action: PayloadAction<{ status: string; progress: number }>) { state.status = action.payload.status; state.progress = action.payload.progress },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, statusSet, processingSet, clearAll } = aiUpscalerSlice.actions
export default aiUpscalerSlice.reducer
