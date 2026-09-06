import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface HtmlMinifierState {
  input: string
  output: string | null
}

const initialState: HtmlMinifierState = { input: '', output: null }

const htmlMinifierSlice = createSlice({
  name: 'htmlMinifier',
  initialState,
  reducers: {
    inputSet(state, action: PayloadAction<string>) {
      state.input = action.payload
    },
    outputSet(state, action: PayloadAction<string>) {
      state.output = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { inputSet, outputSet, clearAll } = htmlMinifierSlice.actions
export default htmlMinifierSlice.reducer
