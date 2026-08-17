import { configureStore } from "@reduxjs/toolkit";
import pdfMergerReducer, {
  filesAdded,
  itemsReplaced,
} from "@/features/pdf-merger/pdfMergerSlice";
import pdfRotateReducer, {
  fileSelected as pdfRotateFileSelected,
} from "@/features/pdf-rotate/pdfRotateSlice";
import pdfRemovePagesReducer, {
  fileSelected as pdfRemovePagesFileSelected,
} from "@/features/pdf-remove-pages/pdfRemovePagesSlice";
import pdfSplitReducer, {
  fileSelected as pdfSplitFileSelected,
} from "@/features/pdf-split/pdfSplitSlice";

export const store = configureStore({
  reducer: {
    pdfMerger: pdfMergerReducer,
    pdfRotate: pdfRotateReducer,
    pdfRemovePages: pdfRemovePagesReducer,
    pdfSplit: pdfSplitReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          filesAdded.type,
          itemsReplaced.type,
          pdfRotateFileSelected.type,
          pdfRemovePagesFileSelected.type,
          pdfSplitFileSelected.type,
        ],
        ignoredPaths: [
          "pdfMerger.items",
          "pdfRotate.item",
          "pdfRemovePages.item",
          "pdfSplit.item",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
