import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface MarkdownToPdfState {
  markdown: string
  status: 'idle' | 'converting' | 'done' | 'error'
  pdfBlobUrl: string | null
}

const initialState: MarkdownToPdfState = {
  markdown: '',
  status: 'idle',
  pdfBlobUrl: null,
}

const markdownToPdfSlice = createSlice({
  name: 'markdownToPdf',
  initialState,
  reducers: {
    markdownSet(state, action: PayloadAction<string>) {
      state.markdown = action.payload
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
  markdownSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = markdownToPdfSlice.actions
export default markdownToPdfSlice.reducer
