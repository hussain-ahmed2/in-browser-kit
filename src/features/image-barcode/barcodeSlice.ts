import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BarcodeResult } from './lib/imageBarcode'

export interface BarcodeState {
  result: BarcodeResult | null
  isProcessing: boolean
}

const initialState: BarcodeState = { result: null, isProcessing: false }

const barcodeSlice = createSlice({
  name: 'imageBarcode',
  initialState,
  reducers: {
    resultSet(state, action: PayloadAction<BarcodeResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) { Object.assign(state, initialState) },
  },
})

export const { resultSet, processingSet, clearAll } = barcodeSlice.actions
export default barcodeSlice.reducer
