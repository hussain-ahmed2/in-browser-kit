import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { IpInfo } from './types'

export interface IpLookupState {
  ipInfo: IpInfo | null
  error: string | null
  isProcessing: boolean
}

const initialState: IpLookupState = {
  ipInfo: null,
  error: null,
  isProcessing: false,
}

const ipLookupSlice = createSlice({
  name: 'ipLookup',
  initialState,
  reducers: {
    processingStarted(state) {
      state.isProcessing = true
      state.error = null
    },
    ipInfoSet(state, action: PayloadAction<IpInfo>) {
      state.ipInfo = action.payload
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

export const { processingStarted, ipInfoSet, errorSet, clearAll } =
  ipLookupSlice.actions
export default ipLookupSlice.reducer
