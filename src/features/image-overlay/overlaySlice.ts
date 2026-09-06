import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { OverlayResult } from './lib/imageOverlay'

export interface OverlayState {
  baseItem: { file: File; previewUrl: string; dims: { width: number; height: number } } | null
  overlayItem: { file: File; previewUrl: string; dims: { width: number; height: number } } | null
  result: OverlayResult | null
  isProcessing: boolean
}

const initialState: OverlayState = {
  baseItem: null,
  overlayItem: null,
  result: null,
  isProcessing: false,
}

const overlaySlice = createSlice({
  name: 'imageOverlay',
  initialState,
  reducers: {
    baseFileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.baseItem = action.payload
      state.result = null
      state.isProcessing = false
    },
    overlayFileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.overlayItem = action.payload
      state.result = null
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<OverlayResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.baseItem?.previewUrl) URL.revokeObjectURL(state.baseItem.previewUrl)
      if (state.overlayItem?.previewUrl) URL.revokeObjectURL(state.overlayItem.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { baseFileSelected, overlayFileSelected, resultSet, processingSet, clearAll } = overlaySlice.actions
export default overlaySlice.reducer
