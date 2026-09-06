import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CaseConverterState {
  text: string
  converted: string | null
}

const initialState: CaseConverterState = { text: '', converted: null }

const caseConverterSlice = createSlice({
  name: 'caseConverter',
  initialState,
  reducers: {
    textSet(state, action: PayloadAction<string>) {
      state.text = action.payload
    },
    convertedSet(state, action: PayloadAction<string | null>) {
      state.converted = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { textSet, convertedSet, clearAll } = caseConverterSlice.actions
export default caseConverterSlice.reducer
