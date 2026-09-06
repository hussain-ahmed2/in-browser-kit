import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ExifSummary, ExifStripResult } from './lib/imageExifStripper'

export interface ExifStripperState {
  item: { file: File; previewUrl: string } | null
  exifSummary: ExifSummary | null
  result: ExifStripResult | null
  isProcessing: boolean
}

const initialState: ExifStripperState = { item: null, exifSummary: null, result: null, isProcessing: false }

const exifStripperSlice = createSlice({
  name: 'imageExifStripper',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = action.payload
      state.exifSummary = null
      state.result = null
      state.isProcessing = false
    },
    exifSummarySet(state, action: PayloadAction<ExifSummary>) { state.exifSummary = action.payload },
    resultSet(state, action: PayloadAction<ExifStripResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, exifSummarySet, resultSet, processingSet, clearAll } = exifStripperSlice.actions
export default exifStripperSlice.reducer
