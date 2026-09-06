import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface CssGradientState {
  type: 'linear' | 'radial'
  colors: string[]
  angle: number
  output: string | null
}

const initialState: CssGradientState = {
  type: 'linear',
  colors: ['#667eea', '#764ba2'],
  angle: 135,
  output: null,
}

const cssGradientSlice = createSlice({
  name: 'cssGradient',
  initialState,
  reducers: {
    typeSet(state, action: PayloadAction<'linear' | 'radial'>) {
      state.type = action.payload
    },
    colorsSet(state, action: PayloadAction<string[]>) {
      state.colors = action.payload
    },
    colorAdded(state, action: PayloadAction<string>) {
      state.colors.push(action.payload)
    },
    colorRemoved(state, action: PayloadAction<number>) {
      state.colors.splice(action.payload, 1)
    },
    colorUpdated(state, action: PayloadAction<{ index: number; color: string }>) {
      state.colors[action.payload.index] = action.payload.color
    },
    angleSet(state, action: PayloadAction<number>) {
      state.angle = action.payload
    },
    outputSet(state, action: PayloadAction<string>) {
      state.output = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  typeSet,
  colorsSet,
  colorAdded,
  colorRemoved,
  colorUpdated,
  angleSet,
  outputSet,
  clearAll,
} = cssGradientSlice.actions
export default cssGradientSlice.reducer
