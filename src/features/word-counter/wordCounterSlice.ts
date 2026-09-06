import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CountResult } from './lib/wordCounter'

export interface WordCounterState {
  text: string
  result: CountResult | null
}

const initialState: WordCounterState = { text: '', result: null }

const wordCounterSlice = createSlice({
  name: 'wordCounter',
  initialState,
  reducers: {
    textSet(state, action: PayloadAction<string>) {
      state.text = action.payload
    },
    resultSet(state, action: PayloadAction<CountResult>) {
      state.result = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { textSet, resultSet, clearAll } = wordCounterSlice.actions
export default wordCounterSlice.reducer
