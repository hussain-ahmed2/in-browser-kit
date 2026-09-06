import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SocialResizeResult } from './lib/imageSocialResizer'

export interface SocialResizerState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  result: SocialResizeResult | null
  isProcessing: boolean
}

const initialState: SocialResizerState = { item: null, dims: null, result: null, isProcessing: false }

const socialResizerSlice = createSlice({
  name: 'imageSocialResizer',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.result = null
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<SocialResizeResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, processingSet, clearAll } = socialResizerSlice.actions
export default socialResizerSlice.reducer
