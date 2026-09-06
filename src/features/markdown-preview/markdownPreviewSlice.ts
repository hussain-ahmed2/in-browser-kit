import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface MarkdownPreviewState {
  markdown: string
  html: string | null
}

const initialState: MarkdownPreviewState = { markdown: '', html: null }

const markdownPreviewSlice = createSlice({
  name: 'markdownPreview',
  initialState,
  reducers: {
    markdownSet(state, action: PayloadAction<string>) {
      state.markdown = action.payload
    },
    htmlSet(state, action: PayloadAction<string>) {
      state.html = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { markdownSet, htmlSet, clearAll } = markdownPreviewSlice.actions
export default markdownPreviewSlice.reducer
