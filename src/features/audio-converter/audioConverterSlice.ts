import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AudioConverterState {
  file: File | null
  outputFormat: 'mp3' | 'wav' | 'ogg' | 'aac' | 'flac'
  status: 'idle' | 'converting' | 'done' | 'error'
  progress: number
  resultBlobUrl: string | null
}

const initialState: AudioConverterState = {
  file: null,
  outputFormat: 'mp3',
  status: 'idle',
  progress: 0,
  resultBlobUrl: null,
}

const audioConverterSlice = createSlice({
  name: 'audioConverter',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<File>) {
      state.file = action.payload
      state.status = 'idle'
      state.progress = 0
      state.resultBlobUrl = null
    },
    outputFormatSet(state, action: PayloadAction<'mp3' | 'wav' | 'ogg' | 'aac' | 'flac'>) {
      state.outputFormat = action.payload
      state.status = 'idle'
      state.resultBlobUrl = null
    },
    conversionStarted(state) {
      state.status = 'converting'
      state.progress = 0
    },
    conversionDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.progress = 100
      state.resultBlobUrl = action.payload
    },
    conversionError(state) {
      state.status = 'error'
      state.progress = 0
    },
    progressSet(state, action: PayloadAction<number>) {
      state.progress = action.payload
    },
    clearAll(state) {
      if (state.resultBlobUrl) URL.revokeObjectURL(state.resultBlobUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  outputFormatSet,
  conversionStarted,
  conversionDone,
  conversionError,
  progressSet,
  clearAll,
} = audioConverterSlice.actions
export default audioConverterSlice.reducer
