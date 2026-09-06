import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CsvToPdfState {
  csv: string
  pageSize: 'a4' | 'letter'
  status: 'idle' | 'converting' | 'done' | 'error'
  pdfBlobUrl: string | null
}

const initialState: CsvToPdfState = {
  csv: '',
  pageSize: 'a4',
  status: 'idle',
  pdfBlobUrl: null,
}

const csvToPdfSlice = createSlice({
  name: 'csvToPdf',
  initialState,
  reducers: {
    csvSet(state, action: PayloadAction<string>) {
      state.csv = action.payload
      state.status = 'idle'
      state.pdfBlobUrl = null
    },
    pageSizeSet(state, action: PayloadAction<'a4' | 'letter'>) {
      state.pageSize = action.payload
    },
    conversionStarted(state) {
      state.status = 'converting'
    },
    conversionDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.pdfBlobUrl = action.payload
    },
    conversionError(state) {
      state.status = 'error'
    },
    clearAll(state) {
      if (state.pdfBlobUrl) URL.revokeObjectURL(state.pdfBlobUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  csvSet,
  pageSizeSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = csvToPdfSlice.actions
export default csvToPdfSlice.reducer
