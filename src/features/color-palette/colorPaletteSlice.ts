import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ColorPalette } from './lib/imageColorPalette'

export interface ColorPaletteState {
  item: { file: File; previewUrl: string } | null
  palette: ColorPalette | null
  colorCount: number
  isProcessing: boolean
}

const initialState: ColorPaletteState = {
  item: null,
  palette: null,
  colorCount: 5,
  isProcessing: false,
}

const colorPaletteSlice = createSlice({
  name: 'imageColorPalette',
  initialState,
  reducers: {
    fileSelected(
      state,
      action: PayloadAction<{ file: File; previewUrl: string }>
    ) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      state.item = {
        file: action.payload.file,
        previewUrl: action.payload.previewUrl,
      }
      state.palette = null
      state.isProcessing = false
    },
    colorCountSet(state, action: PayloadAction<number>) {
      state.colorCount = action.payload
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    paletteSet(state, action: PayloadAction<ColorPalette>) {
      state.palette = action.payload
      state.isProcessing = false
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  colorCountSet,
  processingSet,
  paletteSet,
  clearAll,
} = colorPaletteSlice.actions

export default colorPaletteSlice.reducer
