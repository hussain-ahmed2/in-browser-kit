import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface TextToSpeechState {
  text: string
  voice: string
  rate: number
  pitch: number
  status: 'idle' | 'speaking' | 'error'
}

const initialState: TextToSpeechState = {
  text: '',
  voice: '',
  rate: 1,
  pitch: 1,
  status: 'idle',
}

const textToSpeechSlice = createSlice({
  name: 'textToSpeech',
  initialState,
  reducers: {
    textSet(state, action: PayloadAction<string>) {
      state.text = action.payload
    },
    voiceSet(state, action: PayloadAction<string>) {
      state.voice = action.payload
    },
    rateSet(state, action: PayloadAction<number>) {
      state.rate = action.payload
    },
    pitchSet(state, action: PayloadAction<number>) {
      state.pitch = action.payload
    },
    speakingStarted(state) {
      state.status = 'speaking'
    },
    speakingStopped(state) {
      state.status = 'idle'
    },
    errorOccurred(state) {
      state.status = 'error'
    },
    clearAll(state) {
      window.speechSynthesis?.cancel()
      Object.assign(state, initialState)
    },
  },
})

export const {
  textSet,
  voiceSet,
  rateSet,
  pitchSet,
  speakingStarted,
  speakingStopped,
  errorOccurred,
  clearAll,
} = textToSpeechSlice.actions
export default textToSpeechSlice.reducer
