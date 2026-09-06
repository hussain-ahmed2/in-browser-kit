import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface BoxShadowState {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
  inset: boolean
}

const initialState: BoxShadowState = {
  offsetX: 0,
  offsetY: 4,
  blur: 16,
  spread: 0,
  color: '#000000',
  inset: false,
}

const boxShadowSlice = createSlice({
  name: 'boxShadow',
  initialState,
  reducers: {
    offsetXSet(state, action: PayloadAction<number>) {
      state.offsetX = action.payload
    },
    offsetYSet(state, action: PayloadAction<number>) {
      state.offsetY = action.payload
    },
    blurSet(state, action: PayloadAction<number>) {
      state.blur = action.payload
    },
    spreadSet(state, action: PayloadAction<number>) {
      state.spread = action.payload
    },
    colorSet(state, action: PayloadAction<string>) {
      state.color = action.payload
    },
    insetSet(state, action: PayloadAction<boolean>) {
      state.inset = action.payload
    },
    clearAll(state) {
      Object.assign(state, initialState)
    },
  },
})

export const {
  offsetXSet,
  offsetYSet,
  blurSet,
  spreadSet,
  colorSet,
  insetSet,
  clearAll,
} = boxShadowSlice.actions
export default boxShadowSlice.reducer
