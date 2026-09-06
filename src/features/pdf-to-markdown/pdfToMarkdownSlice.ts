import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface PdfToMarkdownState {
  file: File | null
  progress: number
  status: 'idle' | 'extracting' | 'done' | 'error'
  markdown: string
}

const initialState: PdfToMarkdownState = {
  file: null,
  progress: 0,
  status: 'idle',
  markdown: '',
}

const pdfToMarkdownSlice = createSlice({
  name: 'pdfToMarkdown',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<File>) {
      state.file = action.payload
      state.status = 'idle'
      state.progress = 0
      state.markdown = ''
    },
    extractionStarted(state) {
      state.status = 'extracting'
      state.progress = 0
    },
    extractionDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.progress = 100
      state.markdown = action.payload
    },
    extractionError(state) {
      state.status = 'error'
      state.progress = 0
    },
    markdownSet(state, action: PayloadAction<string>) {
      state.markdown = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  extractionStarted,
  extractionDone,
  extractionError,
  markdownSet,
  clearAll,
} = pdfToMarkdownSlice.actions
export default pdfToMarkdownSlice.reducer
