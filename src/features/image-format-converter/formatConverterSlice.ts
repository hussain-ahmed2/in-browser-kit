import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { FormatConverterResult, OutputFormat } from './lib/imageFormatConverter'

export interface FormatConverterState {
  item: { file: File; previewUrl: string } | null
  dimensions: { width: number; height: number } | null
  format: OutputFormat
  quality: number
  result: FormatConverterResult | null
  isProcessing: boolean
  avifSupported: boolean
  webpSupported: boolean
}

const initialState: FormatConverterState = {
  item: null,
  dimensions: null,
  format: 'image/jpeg',
  quality: 0.9,
  result: null,
  isProcessing: false,
  avifSupported: false,
  webpSupported: false,
}

const formatConverterSlice = createSlice({
  name: 'imageFormatConverter',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dimensions: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dimensions = action.payload.dimensions
      state.result = null
      state.isProcessing = false
    },
    formatSet(state, action: PayloadAction<OutputFormat>) {
      state.format = action.payload
    },
    qualitySet(state, action: PayloadAction<number>) {
      state.quality = action.payload
    },
    resultSet(state, action: PayloadAction<FormatConverterResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    avifSupportedSet(state, action: PayloadAction<boolean>) {
      state.avifSupported = action.payload
    },
    webpSupportedSet(state, action: PayloadAction<boolean>) {
      state.webpSupported = action.payload
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
  resultSet,
  processingSet,
  avifSupportedSet,
  webpSupportedSet,
  clearAll,
} = formatConverterSlice.actions

export default formatConverterSlice.reducer