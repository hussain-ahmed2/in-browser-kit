import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DnsResult } from './types'

export interface DnsLookupState {
  domain: string
  result: DnsResult | null
  recordType: string
  error: string | null
  isProcessing: boolean
}

const initialState: DnsLookupState = {
  domain: '',
  result: null,
  recordType: 'A',
  error: null,
  isProcessing: false,
}

const dnsLookupSlice = createSlice({
  name: 'dnsLookup',
  initialState,
  reducers: {
    domainSet(state, action: PayloadAction<string>) {
      state.domain = action.payload
    },
    recordTypeSet(state, action: PayloadAction<string>) {
      state.recordType = action.payload
    },
    processingStarted(state) {
      state.isProcessing = true
      state.error = null
    },
    resultSet(state, action: PayloadAction<DnsResult>) {
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

export const {
  domainSet,
  recordTypeSet,
  processingStarted,
  resultSet,
  errorSet,
  clearAll,
} = dnsLookupSlice.actions
export default dnsLookupSlice.reducer
