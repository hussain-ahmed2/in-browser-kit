import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CssMinifierState {
  input: string
  output: string | null
  mode: 'minify' | 'beautify'
}

const initialState: CssMinifierState = { input: '', output: null, mode: 'minify' }

const cssMinifierSlice = createSlice({
  name: 'cssMinifier',
  initialState,
  reducers: {
    inputSet(state, action: PayloadAction<string>) {
      state.input = action.payload
    },
    outputSet(state, action: PayloadAction<string>) {
      state.output = action.payload
    },
    modeSet(state, action: PayloadAction<'minify' | 'beautify'>) {
      state.mode = action.payload
      state.output = null
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { inputSet, outputSet, modeSet, clearAll } = cssMinifierSlice.actions
export default cssMinifierSlice.reducer
