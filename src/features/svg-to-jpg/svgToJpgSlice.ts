import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SvgToJpgState {
  svgContent: string
  fileName: string | null
  scale: number
  backgroundColor: string
  status: 'idle' | 'converting' | 'done' | 'error'
  resultBlobUrl: string | null
}

const initialState: SvgToJpgState = {
  svgContent: '',
  fileName: null,
  scale: 1,
  backgroundColor: '#ffffff',
  status: 'idle',
  resultBlobUrl: null,
}

const svgToJpgSlice = createSlice({
  name: 'svgToJpg',
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
    backgroundColorSet(state, action: PayloadAction<string>) {
      state.backgroundColor = action.payload
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
  backgroundColorSet,
  conversionStarted,
  conversionDone,
  conversionError,
  clearAll,
} = svgToJpgSlice.actions
export default svgToJpgSlice.reducer
