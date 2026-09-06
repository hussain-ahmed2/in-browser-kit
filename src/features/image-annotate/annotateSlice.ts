import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Annotation, AnnotateTool } from './types'
import type { AnnotateResult } from './lib/imageAnnotate'

export interface AnnotateState {
  item: { file: File; previewUrl: string } | null
  dims: { width: number; height: number } | null
  tool: AnnotateTool
  annotations: Annotation[]
  activeAnnotation: string | null
  color: string
  strokeWidth: number
  fontSize: number
  result: AnnotateResult | null
  isProcessing: boolean
}

const initialState: AnnotateState = {
  item: null,
  dims: null,
  tool: 'arrow',
  annotations: [],
  activeAnnotation: null,
  color: '#ff0000',
  strokeWidth: 3,
  fontSize: 24,
  result: null,
  isProcessing: false,
}

const annotateSlice = createSlice({
  name: 'imageAnnotate',
  initialState,
  reducers: {
    fileSelected(state, action: PayloadAction<{ file: File; previewUrl: string; dims: { width: number; height: number } }>) {
      state.item = { file: action.payload.file, previewUrl: action.payload.previewUrl }
      state.dims = action.payload.dims
      state.annotations = []
      state.result = null
      state.isProcessing = false
    },
    toolSet(state, action: PayloadAction<AnnotateTool>) {
      state.tool = action.payload
    },
    colorSet(state, action: PayloadAction<string>) {
      state.color = action.payload
    },
    strokeWidthSet(state, action: PayloadAction<number>) {
      state.strokeWidth = action.payload
    },
    fontSizeSet(state, action: PayloadAction<number>) {
      state.fontSize = action.payload
    },
    annotationAdded(state, action: PayloadAction<Annotation>) {
      state.annotations.push(action.payload)
      state.result = null
    },
    annotationRemoved(state, action: PayloadAction<string>) {
      state.annotations = state.annotations.filter((a) => a.id !== action.payload)
      state.result = null
    },
    activeAnnotationSet(state, action: PayloadAction<string | null>) {
      state.activeAnnotation = action.payload
    },
    annotationsCleared(state) {
      state.annotations = []
      state.result = null
    },
    resultSet(state, action: PayloadAction<AnnotateResult>) {
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
  fileSelected, toolSet, colorSet, strokeWidthSet, fontSizeSet,
  annotationAdded, annotationRemoved, activeAnnotationSet, annotationsCleared,
  resultSet, processingSet, clearAll,
} = annotateSlice.actions
export default annotateSlice.reducer
