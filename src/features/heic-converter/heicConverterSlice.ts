import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HeicConverterResult } from './lib/imageHeicConverter'

export type HeicOutputFormat = 'image/jpeg' | 'image/png'

export interface HeicConverterState {
  item: { file: File; previewUrl: string } | null
  result: HeicConverterResult | null
  isProcessing: boolean
  outputFormat: HeicOutputFormat
  quality: number
}

const initialState: HeicConverterState = {
  item: null,
  result: null,
  isProcessing: false,
  outputFormat: 'image/jpeg',
  quality: 0.9,
}

const heicConverterSlice = createSlice({
  name: 'imageHeicConverter',
  initialState,
  reducers: {
    fileSelected(
      state,
      action: PayloadAction<{ file: File; previewUrl: string }>
    ) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      state.item = {
        file: action.payload.file,
        previewUrl: action.payload.previewUrl,
      }
      state.result = null
      state.isProcessing = false
    },
    formatSet(state, action: PayloadAction<HeicOutputFormat>) {
      state.outputFormat = action.payload
    },
    qualitySet(state, action: PayloadAction<number>) {
      state.quality = action.payload
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    resultSet(state, action: PayloadAction<HeicConverterResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  formatSet,
  qualitySet,
  processingSet,
  resultSet,
  clearAll,
} = heicConverterSlice.actions

export default heicConverterSlice.reducer
