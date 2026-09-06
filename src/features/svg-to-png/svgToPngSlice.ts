import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SvgToPngState {
  svgContent: string
  fileName: string | null
  scale: number
  status: 'idle' | 'converting' | 'done' | 'error'
  resultBlobUrl: string | null
}

const initialState: SvgToPngState = {
  svgContent: '',
  fileName: null,
  scale: 1,
  status: 'idle',
  resultBlobUrl: null,
}

const svgToPngSlice = createSlice({
  name: 'svgToPng',
  initialState,
  reducers: {
    svgSet(state, action: PayloadAction<{ content: string; fileName?: string }>) {
      state.svgContent = action.payload.content
      state.fileName = action.payload.fileName ?? null
      state.status = 'idle'
      state.resultBlobUrl = null
    },
    scaleSet(state, action: PayloadAction<number>) {
      state.scale = action.payload
    },
    conversionStarted(state) {
      state.status = 'converting'
    },
    conversionDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.resultBlobUrl = action.payload
    },
    conversionError(state) {
      state.status = 'error'
    },
    clearAll(state) {
      if (state.resultBlobUrl) URL.revokeObjectURL(state.resultBlobUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  svgSet,
  scaleSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = svgToPngSlice.actions
export default svgToPngSlice.reducer
