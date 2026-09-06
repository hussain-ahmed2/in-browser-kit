import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface AudioSpeedState {
  file: File | null
  speed: number
  status: 'idle' | 'processing' | 'done' | 'error'
  progress: number
  resultBlobUrl: string | null
}

const initialState: AudioSpeedState = {
  file: null,
  speed: 1,
  status: 'idle',
  progress: 0,
  resultBlobUrl: null,
}

const audioSpeedSlice = createSlice({
  name: 'audioSpeed',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<File>) {
      state.file = action.payload
      state.status = 'idle'
      state.progress = 0
      state.resultBlobUrl = null
    },
    speedSet(state, action: PayloadAction<number>) {
      state.speed = action.payload
    },
    processingStarted(state) {
      state.status = 'processing'
      state.progress = 0
    },
    processingDone(state, action: PayloadAction<string>) {
      state.status = 'done'
      state.progress = 100
      state.resultBlobUrl = action.payload
    },
    processingError(state) {
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
  speedSet,
  processingStarted,
  processingDone,
  processingError,
  progressSet,
  clearAll,
} = audioSpeedSlice.actions
export default audioSpeedSlice.reducer
