import {
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import type { CropArea, AspectRatio, CropResult } from './lib/imageCrop'
import { ASPECT_RATIOS } from './lib/imageCrop'

export interface CropState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  cropArea: CropArea | null
  aspectRatio: AspectRatio
  customRatio: string
  gridType: 'none' | 'thirds' | 'golden' | 'center'
  showPreview: boolean
  dragMode: 'none' | 'create' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e'
  dragStart: { x: number; y: number } | null
  result: CropResult | null
  isProcessing: boolean
}

const initialState: CropState = {
  item: null,
  dims: null,
  cropArea: null,
  aspectRatio: 'free',
  customRatio: '',
  gridType: 'thirds',
  showPreview: true,
  dragMode: 'none',
  dragStart: null,
  result: null,
  isProcessing: false,
}

const cropSlice = createSlice({
  name: 'imageCrop',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.cropArea = { x: 0, y: 0, width: action.payload.dims.width, height: action.payload.dims.height }
      state.result = null
      state.isProcessing = false
    },
    cropAreaSet(state, action: PayloadAction<CropArea>) {
      state.cropArea = action.payload
    },
    cropAreaReset(state) {
      if (state.dims) {
        state.cropArea = { x: 0, y: 0, width: state.dims.width, height: state.dims.height }
      }
    },
    aspectRatioSet(state, action: PayloadAction<AspectRatio>) {
      state.aspectRatio = action.payload
      if (action.payload !== 'custom') {
        state.customRatio = ''
      }
      // Adjust crop area to fit within image bounds with the new aspect ratio
      if (state.dims && state.cropArea) {
        const ratio = ASPECT_RATIOS[action.payload]
        if (ratio !== null) {
          const { width: iw, height: ih } = state.dims
          let w: number, h: number
          if (iw / ih > ratio) {
            h = ih
            w = h * ratio
          } else {
            w = iw
            h = w / ratio
          }
          state.cropArea = {
            x: Math.max(0, Math.min(state.cropArea.x, iw - w)),
            y: Math.max(0, Math.min(state.cropArea.y, ih - h)),
            width: w,
            height: h,
          }
        }
      }
    },
    customRatioSet(state, action: PayloadAction<string>) {
      state.customRatio = action.payload
    },
    gridTypeSet(state, action: PayloadAction<'none' | 'thirds' | 'golden' | 'center'>) {
      state.gridType = action.payload
    },
    showPreviewSet(state, action: PayloadAction<boolean>) {
      state.showPreview = action.payload
    },
    dragModeSet(state, action: PayloadAction<CropState['dragMode']>) {
      state.dragMode = action.payload
    },
    dragStartSet(state, action: PayloadAction<{ x: number; y: number } | null>) {
      state.dragStart = action.payload
    },
    resultSet(state, action: PayloadAction<CropResult>) {
      state.result = action.payload
      state.isProcessing = false
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl)
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl)
      Object.assign(state, initialState)
    },
  },
})

export const {
  fileSelected,
  cropAreaSet,
  cropAreaReset,
  aspectRatioSet,
  customRatioSet,
  gridTypeSet,
  showPreviewSet,
  dragModeSet,
  dragStartSet,
  resultSet,
  processingSet,
  clearAll,
} = cropSlice.actions

export default cropSlice.reducer