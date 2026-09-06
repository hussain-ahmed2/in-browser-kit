import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ProfilePicResult } from './lib/imageProfilePic'

export interface ProfilePicState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  result: ProfilePicResult | null
  isProcessing: boolean
}

const initialState: ProfilePicState = { item: null, dims: null, result: null, isProcessing: false }

const profilePicSlice = createSlice({
  name: 'imageProfilePic',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.result = null
      state.isProcessing = false
    },
    resultSet(state, action: PayloadAction<ProfilePicResult>) { state.result = action.payload; state.isProcessing = false },
    processingSet(state, action: PayloadAction<boolean>) { state.isProcessing = action.payload },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const { fileSelected, resultSet, processingSet, clearAll } = profilePicSlice.actions
export default profilePicSlice.reducer
