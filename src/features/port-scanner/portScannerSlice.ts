import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PortResult } from './types'

export interface PortScannerState {
  host: string
  results: PortResult[]
  isProcessing: boolean
}

const initialState: PortScannerState = {
  host: '',
  results: [],
  isProcessing: false,
}

const portScannerSlice = createSlice({
  name: 'portScanner',
  initialState,
  reducers: {
    hostSet(state, action: PayloadAction<string>) {
      state.host = action.payload
    },
    processingStarted(state) {
      state.isProcessing = true
      state.results = []
    },
    portResultAdded(state, action: PayloadAction<PortResult>) {
      // Update existing or add new
      const idx = state.results.findIndex(
        (r) => r.port === action.payload.port
      )
      if (idx >= 0) {
        state.results[idx] = action.payload
      } else {
        state.results.push(action.payload)
      }
    },
    resultSet(state, action: PayloadAction<PortResult[]>) {
      state.results = action.payload
      state.isProcessing = false
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  hostSet,
  processingStarted,
  portResultAdded,
  resultSet,
  clearAll,
} = portScannerSlice.actions
export default portScannerSlice.reducer
