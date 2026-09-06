import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SpriteResult } from './lib/imageCssSprite'

export interface CssSpriteItem {
  file: File
  previewUrl: string
}

export interface CssSpriteState {
  items: CssSpriteItem[]
  result: SpriteResult | null
  isProcessing: boolean
}

const initialState: CssSpriteState = { items: [], result: null, isProcessing: false }

const cssSpriteSlice = createSlice({
  name: 'imageCssSprite',
  initialState,
  reducers: {
    filesAdded(state, action: PayloadAction<CssSpriteItem[]>) { state.items.push(...action.payload); state.result = null },
    fileRemoved(state, action: PayloadAction<number>) {
      const item = state.items[action.payload]
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      state.items.splice(action.payload, 1)
      state.result = null
    },
    resultSet(state, action: PayloadAction<SpriteResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      state.items.forEach((i) => { if (i.previewUrl) URL.revokeObjectURL(i.previewUrl) })
      if (state.result?.imageObjectUrl) URL.revokeObjectURL(state.result.imageObjectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { filesAdded, fileRemoved, resultSet, processingSet, clearAll } = cssSpriteSlice.actions
export default cssSpriteSlice.reducer
