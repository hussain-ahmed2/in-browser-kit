import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CronGeneratorState {
  expression: string
  description: string[] | null
}

const initialState: CronGeneratorState = { expression: '', description: null }

const cronGeneratorSlice = createSlice({
  name: 'cronGenerator',
  initialState,
  reducers: {
    expressionSet(state, action: PayloadAction<string>) {
      state.expression = action.payload
    },
    descriptionSet(state, action: PayloadAction<string[]>) {
      state.description = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { expressionSet, descriptionSet, clearAll } = cronGeneratorSlice.actions
export default cronGeneratorSlice.reducer
