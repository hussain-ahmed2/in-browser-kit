import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface XmlBeautifierState {
  input: string
  output: string | null
  error: string | null
}

const initialState: XmlBeautifierState = { input: '', output: null, error: null }

const xmlBeautifierSlice = createSlice({
  name: 'xmlBeautifier',
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
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { inputSet, outputSet, errorSet, clearAll } = xmlBeautifierSlice.actions
export default xmlBeautifierSlice.reducer
