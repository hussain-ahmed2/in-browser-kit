import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type JsonCsvMode = 'json-to-csv' | 'csv-to-json'

export interface JsonCsvState {
  input: string
  output: string | null
  mode: JsonCsvMode
  error: string | null
}

const initialState: JsonCsvState = { input: '', output: null, mode: 'json-to-csv', error: null }

const jsonCsvSlice = createSlice({
  name: 'jsonCsv',
  initialState,
  reducers: {
    inputSet(state, action: PayloadAction<string>) {
      state.input = action.payload
    },
    outputSet(state, action: PayloadAction<string>) {
      state.output = action.payload
      state.error = null
    },
    errorSet(state, action: PayloadAction<string>) {
      state.error = action.payload
      state.output = null
    },
    modeSet(state, action: PayloadAction<JsonCsvMode>) {
      state.mode = action.payload
      state.error = null
    },
    swapMode(state) {
      state.mode = state.mode === 'json-to-csv' ? 'csv-to-json' : 'json-to-csv'
      state.input = state.output || ''
      state.output = null
      state.error = null
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { inputSet, outputSet, errorSet, modeSet, swapMode, clearAll } = jsonCsvSlice.actions
export default jsonCsvSlice.reducer
