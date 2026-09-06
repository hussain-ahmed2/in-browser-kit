import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface SpeechToTextState {
  language: string
  status: 'idle' | 'listening' | 'error'
  transcript: string
  interimTranscript: string
}

const initialState: SpeechToTextState = {
  language: 'en-US',
  status: 'idle',
  transcript: '',
  interimTranscript: '',
}

const speechToTextSlice = createSlice({
  name: 'speechToText',
  initialState,
  reducers: {
    languageSet(state, action: PayloadAction<string>) {
      state.language = action.payload
    },
    listeningStarted(state) {
      state.status = 'listening'
      state.interimTranscript = ''
    },
    listeningStopped(state) {
      state.status = 'idle'
      state.interimTranscript = ''
    },
    transcriptUpdated(state, action: PayloadAction<{ transcript: string; interim: string }>) {
      state.transcript = action.payload.transcript
      state.interimTranscript = action.payload.interim
    },
    transcriptAppended(state, action: PayloadAction<string>) {
      state.transcript += action.payload
    },
    transcriptSet(state, action: PayloadAction<string>) {
      state.transcript = action.payload
    },
    errorOccurred(state) {
      state.status = 'error'
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  languageSet,
  listeningStarted,
  listeningStopped,
  transcriptUpdated,
  transcriptAppended,
  transcriptSet,
  errorOccurred,
  clearAll,
} = speechToTextSlice.actions
export default speechToTextSlice.reducer
