import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface JsonYamlState {
  input: string
  output: string | null
  mode: 'json-to-yaml' | 'yaml-to-json'
}

const initialState: JsonYamlState = { input: '', output: null, mode: 'json-to-yaml' }

const jsonYamlSlice = createSlice({
  name: 'jsonYaml',
  initialState,
  reducers: {
    inputSet(state, action: PayloadAction<string>) {
      state.input = action.payload
    },
    outputSet(state, action: PayloadAction<string>) {
      state.output = action.payload
    },
    modeSet(state, action: PayloadAction<'json-to-yaml' | 'yaml-to-json'>) {
      state.mode = action.payload
      state.output = null
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const { inputSet, outputSet, modeSet, clearAll } = jsonYamlSlice.actions
export default jsonYamlSlice.reducer
