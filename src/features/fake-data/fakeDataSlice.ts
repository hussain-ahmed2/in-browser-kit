import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface FakeDataState {
  dataType: string
  count: number
  results: string[]
}

const initialState: FakeDataState = { dataType: 'names', count: 10, results: [] }

const fakeDataSlice = createSlice({
  name: 'fakeData',
  initialState,
  reducers: {
    dataTypeSet(state, action: PayloadAction<string>) {
      state.dataType = action.payload
      state.results = []
    },
    countSet(state, action: PayloadAction<number>) {
      state.count = action.payload
    },
    resultsSet(state, action: PayloadAction<string[]>) {
      state.results = action.payload
    },
    clearResults(state) {
      state.results = []
    },
  },
})

export const { dataTypeSet, countSet, resultsSet, clearResults } = fakeDataSlice.actions
export default fakeDataSlice.reducer
