import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CaptureResult } from './lib/screenCapture'

export interface ScreenCaptureState {
  stream: MediaStream | null
  screenshots: CaptureResult[]
  isCapturing: boolean
}

const initialState: ScreenCaptureState = { stream: null, screenshots: [], isCapturing: false }

const screenCaptureSlice = createSlice({
  name: 'screenCapture',
  initialState,
  reducers: {
    captureStarted(state, action: PayloadAction<MediaStream>) {
      state.stream = action.payload
      state.isCapturing = true
      state.screenshots = []
    },
    screenshotAdded(state, action: PayloadAction<CaptureResult>) {
      state.screenshots.push(action.payload)
    },
    captureStopped(state) {
      state.stream = null
      state.isCapturing = false
    },
    clearAll(_state) {
      Object.assign(_state, initialState)
    },
  },
})

export const { captureStarted, screenshotAdded, captureStopped, clearAll } = screenCaptureSlice.actions
export default screenCaptureSlice.reducer
