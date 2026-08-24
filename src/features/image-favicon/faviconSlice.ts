import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FaviconResult, FaviconOptions } from './lib/imageFavicon'

export interface FaviconState {
  item: { file: File; previewUrl: string } | null
  dimensions: { width: number; height: number } | null
  options: FaviconOptions
  result: FaviconResult | null
  isProcessing: boolean
}

const initialState: FaviconState = {
  item: null,
  dimensions: null,
  options: {
    mode: 'pad',
    backgroundColor: '#ffffff',
    selectedSizes: [16, 32, 48, 64, 128, 256, 512, 180, 192, 512],
  },
  result: null,
  isProcessing: false,
}

const faviconSlice = createSlice({
  name: 'imageFavicon',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dimensions: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dimensions = action.payload.dimensions
      state.result = null
      state.isProcessing = false
    },
    optionsSet(state, action: PayloadAction<Partial<FaviconOptions>>) {
      state.options = { ...state.options, ...action.payload }
    },
    resultSet(state, action: PayloadAction<FaviconResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.icoDataUrl) URL.revokeObjectURL(state.result.icoDataUrl)
      state.result?.pngs.forEach((p) => URL.revokeObjectURL(p.dataUrl))
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  optionsSet,
  resultSet,
  processingSet,
  clearAll,
} = faviconSlice.actions

export default faviconSlice.reducer