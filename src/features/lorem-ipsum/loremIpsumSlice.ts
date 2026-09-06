import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface LoremIpsumState {
  result: string | null
}

const initialState: LoremIpsumState = { result: null }

const loremIpsumSlice = createSlice({
  name: 'loremIpsum',
  initialState,
  reducers: {
    resultSet(state, action: PayloadAction<string>) {
      state.result = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { resultSet, clearAll } = loremIpsumSlice.actions
export default loremIpsumSlice.reducer
