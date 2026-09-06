import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { HtmlToImageResult } from './lib/imageHtmlToImage'

export interface HtmlToImageState {
  result: HtmlToImageResult | null
  isProcessing: boolean
}

const initialState: HtmlToImageState = { result: null, isProcessing: false }

const htmlToImageSlice = createSlice({
  name: 'imageHtmlToImage',
  initialState,
  reducers: {
    resultSet(state, action: PayloadAction<HtmlToImageResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { resultSet, processingSet, clearAll } = htmlToImageSlice.actions
export default htmlToImageSlice.reducer
