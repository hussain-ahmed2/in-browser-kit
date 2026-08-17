import { configureStore } from "@reduxjs/toolkit";
import pdfMergerReducer from "@/features/pdf-merger/pdfMergerSlice";
import { filesAdded, itemsReplaced } from "@/features/pdf-merger/pdfMergerSlice";

export const store = configureStore({
  reducer: {
    pdfMerger: pdfMergerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [filesAdded.type, itemsReplaced.type],
        ignoredPaths: ["pdfMerger.items"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;