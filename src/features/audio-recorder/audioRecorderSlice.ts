import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Recording } from './lib/audioRecorder'

export interface AudioRecorderState {
  isRecording: boolean
  recordings: Recording[]
  stream: MediaStream | null
  duration: number
}

const initialState: AudioRecorderState = { isRecording: false, recordings: [], stream: null, duration: 0 }

const audioRecorderSlice = createSlice({
  name: 'audioRecorder',
  initialState,
  reducers: {
    recordingStarted(state, action: PayloadAction<MediaStream>) {
      state.isRecording = true
      state.stream = action.payload
      state.duration = 0
    },
    recordingStopped(state, action: PayloadAction<Recording>) {
      state.isRecording = false
      state.stream = null
      state.recordings.unshift(action.payload)
      state.duration = action.payload.duration
    },
    durationTicked(state) {
      if (state.isRecording) state.duration += 1
    },
    recordingDeleted(state, action: PayloadAction<string>) {
      const idx = state.recordings.findIndex((r) => r.id === action.payload)
      if (idx !== -1) {
        URL.revokeObjectURL(state.recordings[idx].url)
        state.recordings.splice(idx, 1)
      }
    },
    clearAll(state) {
      state.recordings.forEach((r) => URL.revokeObjectURL(r.url))
      Object.assign(state, initialState)
    },
  },
})

export const { recordingStarted, recordingStopped, durationTicked, recordingDeleted, clearAll } = audioRecorderSlice.actions
export default audioRecorderSlice.reducer
