import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AudioTrimmerState {
  file: File | null
  startTime: string
  duration: string
  outputFormat: string
  status: 'idle' | 'trimming' | 'done' | 'error'
  progress: number
  resultBlobUrl: string | null
}

const initialState: AudioTrimmerState = {
  file: null,
  startTime: '00:00:00',
  duration: '00:00:10',
  outputFormat: 'mp3',
  status: 'idle',
  progress: 0,
  resultBlobUrl: null,
}

const audioTrimmerSlice = createSlice({
  name: 'audioTrimmer',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<File>) {
      state.file = action.payload
      state.status = 'idle'
      state.progress = 0
      state.resultBlobUrl = null
    },
    startTimeSet(state, action: PayloadAction<string>) {
      state.startTime = action.payload
    },
    durationSet(state, action: PayloadAction<string>) {
      state.duration = action.payload
    },
    outputFormatSet(state, action: PayloadAction<string>) {
      state.outputFormat = action.payload
    },
    trimmingStarted(state) {
      state.status = 'trimming'
      state.progress = 0
    },
    trimmingDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.progress = 100
      state.resultBlobUrl = action.payload
    },
    trimmingError(state) {
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
  startTimeSet,
  durationSet,
  outputFormatSet,
  trimmingStarted,
  trimmingDone,
  trimmingError,
  progressSet,
  clearAll,
} = audioTrimmerSlice.actions
export default audioTrimmerSlice.reducer
