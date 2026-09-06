import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PlaceholderResult } from './lib/imageLazyPlaceholder'

export interface LazyPlaceholderState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  result: PlaceholderResult | null
  isProcessing: boolean
}

const initialState: LazyPlaceholderState = { item: null, dims: null, result: null, isProcessing: false }

const lazyPlaceholderSlice = createSlice({
  name: 'imageLazyPlaceholder',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.result = null
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<PlaceholderResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, processingSet, clearAll } = lazyPlaceholderSlice.actions
export default lazyPlaceholderSlice.reducer
