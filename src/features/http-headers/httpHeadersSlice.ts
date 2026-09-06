import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HeadersResult } from './types'

export interface HttpHeadersState {
  url: string
  result: HeadersResult | null
  error: string | null
  isProcessing: boolean
}

const initialState: HttpHeadersState = {
  url: '',
  result: null,
  error: null,
  isProcessing: false,
}

const httpHeadersSlice = createSlice({
  name: 'httpHeaders',
  initialState,
  reducers: {
    urlSet(state, action: PayloadAction<string>) {
      state.url = action.payload
    },
    processingStarted(state) {
      state.isProcessing = true
      state.error = null
    },
    resultSet(state, action: PayloadAction<HeadersResult>) {
      state.result = action.payload
      state.isProcessing = false
      state.error = null
    },
    errorSet(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.isProcessing = false
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { urlSet, processingStarted, resultSet, errorSet, clearAll } =
  httpHeadersSlice.actions
export default httpHeadersSlice.reducer
