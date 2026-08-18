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
import pdfLockReducer, {
  fileSelected as pdfLockFileSelected,
  fileReplaced as pdfLockFileReplaced,
} from "@/features/pdf-lock/pdfLockSlice";
import imageToPdfReducer, {
  filesAdded as imageToPdfFilesAdded,
  itemsReplaced as imageToPdfItemsReplaced,
} from "@/features/image-to-pdf/imageToPdfSlice";

export const store = configureStore({
  reducer: {
    pdfMerger: pdfMergerReducer,
    pdfRotate: pdfRotateReducer,
    pdfRemovePages: pdfRemovePagesReducer,
    pdfSplit: pdfSplitReducer,
    pdfLock: pdfLockReducer,
    imageToPdf: imageToPdfReducer,
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
          pdfLockFileSelected.type,
          pdfLockFileReplaced.type,
          imageToPdfFilesAdded.type,
          imageToPdfItemsReplaced.type,
        ],
        ignoredPaths: [
          "pdfMerger.items",
          "pdfRotate.item",
          "pdfRemovePages.item",
          "pdfSplit.item",
          "pdfLock.item",
          "imageToPdf.items",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
