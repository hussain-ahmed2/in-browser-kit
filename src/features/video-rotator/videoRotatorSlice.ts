import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VideoRotatorResult, VideoRotation } from "./types";

export interface VideoRotatorState {
  item: { file: File; previewUrl: string } | null;
  rotation: VideoRotation;
  result: VideoRotatorResult | null;
  progress: number;
  status: string;
  isProcessing: boolean;
}

const initialState: VideoRotatorState = {
  item: null,
  rotation: "90",
  result: null,
  progress: 0,
  status: "",
  isProcessing: false,
};

const videoRotatorSlice = createSlice({
  name: "videoRotator",
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
    rotationSet(state, action: PayloadAction<VideoRotation>) {
      state.rotation = action.payload;
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
    resultSet(state, action: PayloadAction<VideoRotatorResult>) {
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
  rotationSet,
  processingSet,
  progressSet,
  statusSet,
  resultSet,
  clearAll,
} = videoRotatorSlice.actions;

export default videoRotatorSlice.reducer;
