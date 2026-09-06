import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface JsMinifierState {
  input: string
  output: string | null
}

const initialState: JsMinifierState = { input: '', output: null }

const jsMinifierSlice = createSlice({
  name: 'jsMinifier',
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

export const { inputSet, outputSet, clearAll } = jsMinifierSlice.actions
export default jsMinifierSlice.reducer
