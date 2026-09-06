import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { CollageResult } from './lib/imageCollage'

export interface CollageItem {
  file: File
  previewUrl: string
  dims: { width: number; height: number }
}

export interface CollageState {
  items: CollageItem[]
  result: CollageResult | null
  isProcessing: boolean
}

const initialState: CollageState = {
  items: [],
  result: null,
  isProcessing: false,
}

const collageSlice = createSlice({
  name: 'imageCollage',
  initialState,
  reducers: {
    filesAdded(state, action: PayloadAction<CollageItem[]>) {
      state.items.push(...action.payload)
      state.result = null
    },
    fileRemoved(state, action: PayloadAction<number>) {
      const item = state.items[action.payload]
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
      state.items.splice(action.payload, 1)
      state.result = null
    },
    resultSet(state, action: PayloadAction<CollageResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      state.items.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      })
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { filesAdded, fileRemoved, resultSet, processingSet, clearAll } = collageSlice.actions
export default collageSlice.reducer
