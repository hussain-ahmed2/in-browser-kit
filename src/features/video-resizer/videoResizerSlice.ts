import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VideoResizerResult } from "./types";

export interface VideoResizerState {
  item: { file: File; previewUrl: string } | null;
  result: VideoResizerResult | null;
  progress: number;
  status: string;
  isProcessing: boolean;
}

const initialState: VideoResizerState = {
  item: null,
  result: null,
  progress: 0,
  status: "",
  isProcessing: false,
};

const videoResizerSlice = createSlice({
  name: "videoResizer",
  initialState,
  reducers: {
    fileSelected(
      state,
      action: PayloadAction<{ file: File; previewUrl: string }>,
    ) {
      state.item = action.payload;
      state.result = null;
      state.progress = 0;
      state.status = "";
      state.isProcessing = false;
    },
    processingSet(state, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    progressSet(state, action: PayloadAction<number>) {
      state.progress = action.payload;
    },
    statusSet(state, action: PayloadAction<string>) {
      state.status = action.payload;
    },
    resultSet(state, action: PayloadAction<VideoResizerResult>) {
      state.result = action.payload;
      state.isProcessing = false;
      state.progress = 0;
      state.status = "";
    },
    clearAll(state) {
      if (state.item?.previewUrl) URL.revokeObjectURL(state.item.previewUrl);
      if (state.result?.objectUrl) URL.revokeObjectURL(state.result.objectUrl);
      Object.assign(state, initialState);
    },
  },
});

export const {
  fileSelected,
  processingSet,
  progressSet,
  statusSet,
  resultSet,
  clearAll,
} = videoResizerSlice.actions;

export default videoResizerSlice.reducer;
