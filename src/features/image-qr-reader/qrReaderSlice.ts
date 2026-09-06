import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface QrReaderState {
  item: { file: File; previewUrl: string } | null
  decodedData: string | null
  error: string | null
  isProcessing: boolean
}

const initialState: QrReaderState = { item: null, decodedData: null, error: null, isProcessing: false }

const qrReaderSlice = createSlice({
  name: 'imageQrReader',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string }>) {
      state.item = action.payload
      state.decodedData = null
      state.error = null
      state.isProcessing = false
    },
    decodedSet(state, action: PayloadAction<string>) { state.decodedData = action.payload; state.isProcessing = false },
    errorSet(state, action: PayloadAction<string>) { state.error = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, decodedSet, errorSet, processingSet, clearAll } = qrReaderSlice.actions
export default qrReaderSlice.reducer
