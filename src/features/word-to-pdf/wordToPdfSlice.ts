import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface WordToPdfState {
  file: File | null
  progress: number
  status: 'idle' | 'converting' | 'done' | 'error'
  pdfBlobUrl: string | null
}

const initialState: WordToPdfState = {
  file: null,
  progress: 0,
  status: 'idle',
  pdfBlobUrl: null,
}

const wordToPdfSlice = createSlice({
  name: 'wordToPdf',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<File>) {
      state.file = action.payload
      state.status = 'idle'
      state.progress = 0
      state.pdfBlobUrl = null
    },
    progressSet(state, action: PayloadAction<number>) {
      state.progress = action.payload
    },
    conversionStarted(state) {
      state.status = 'converting'
      state.progress = 0
    },
    conversionDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.progress = 100
      state.pdfBlobUrl = action.payload
    },
    conversionError(state) {
      state.status = 'error'
      state.progress = 0
    },
    clearAll(state) {
      if (state.pdfBlobUrl) URL.revokeObjectURL(state.pdfBlobUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  progressSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = wordToPdfSlice.actions
export default wordToPdfSlice.reducer
