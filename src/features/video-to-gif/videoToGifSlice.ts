import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { VideoToGifResult } from "./types";

export interface VideoToGifState {
  item: { file: File; previewUrl: string } | null;
  result: VideoToGifResult | null;
  progress: number;
  status: string;
  isProcessing: boolean;
}

const initialState: VideoToGifState = {
  item: null,
  result: null,
  progress: 0,
  status: "",
  isProcessing: false,
};

const videoToGifSlice = createSlice({
  name: "videoToGif",
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
    resultSet(state, action: PayloadAction<VideoToGifResult>) {
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
} = videoToGifSlice.actions;

export default videoToGifSlice.reducer;
