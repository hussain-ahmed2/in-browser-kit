import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GifToVideoResult } from "./types";

export interface GifToVideoState {
  item: { file: File; previewUrl: string } | null;
  result: GifToVideoResult | null;
  progress: number;
  status: string;
  isProcessing: boolean;
}

const initialState: GifToVideoState = {
  item: null,
  result: null,
  progress: 0,
  status: "",
  isProcessing: false,
};

const gifToVideoSlice = createSlice({
  name: "gifToVideo",
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
    resultSet(state, action: PayloadAction<GifToVideoResult>) {
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
} = gifToVideoSlice.actions;

export default gifToVideoSlice.reducer;
