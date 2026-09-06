import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ExcelToPdfState {
  file: File | null
  csvText: string
  headers: string[]
  rows: Record<string, string>[]
  status: 'idle' | 'converting' | 'done' | 'error'
  pdfBlobUrl: string | null
}

const initialState: ExcelToPdfState = {
  file: null,
  csvText: '',
  headers: [],
  rows: [],
  status: 'idle',
  pdfBlobUrl: null,
}

const excelToPdfSlice = createSlice({
  name: 'excelToPdf',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; csvText: string; headers: string[]; rows: Record<string, string>[] }>) {
      state.file = action.payload.file
      state.csvText = action.payload.csvText
      state.headers = action.payload.headers
      state.rows = action.payload.rows
      state.status = 'idle'
      state.pdfBlobUrl = null
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
  fileSelected,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = excelToPdfSlice.actions
export default excelToPdfSlice.reducer
