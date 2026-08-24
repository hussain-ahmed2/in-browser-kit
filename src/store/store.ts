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
import imageCropReducer, {
  fileSelected as cropFileSelected,
  resultSet as cropResultSet,
  clearAll as cropClearAll,
} from "@/features/image-crop/cropSlice";
import imageFormatConverterReducer, {
  fileSelected as formatConverterFileSelected,
  resultSet as formatConverterResultSet,
  clearAll as formatConverterClearAll,
} from "@/features/image-format-converter/formatConverterSlice";
import imageFaviconReducer, {
  fileSelected as faviconFileSelected,
  resultSet as faviconResultSet,
  clearAll as faviconClearAll,
} from "@/features/image-favicon/faviconSlice";
import imageGifOptimizerReducer, {
  fileSelected as gifOptimizerFileSelected,
  resultSet as gifOptimizerResultSet,
  clearAll as gifOptimizerClearAll,
} from "@/features/image-gif-optimizer/gifOptimizerSlice";

export const store = configureStore({
  reducer: {
    pdfMerger: pdfMergerReducer,
    pdfRotate: pdfRotateReducer,
    pdfRemovePages: pdfRemovePagesReducer,
    pdfSplit: pdfSplitReducer,
    pdfLock: pdfLockReducer,
    imageToPdf: imageToPdfReducer,
    imageCrop: imageCropReducer,
    imageFormatConverter: imageFormatConverterReducer,
    imageFavicon: imageFaviconReducer,
    imageGifOptimizer: imageGifOptimizerReducer,
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
          cropFileSelected.type,
          cropResultSet.type,
          cropClearAll.type,
          formatConverterFileSelected.type,
          formatConverterResultSet.type,
          formatConverterClearAll.type,
          faviconFileSelected.type,
          faviconResultSet.type,
          faviconClearAll.type,
          gifOptimizerFileSelected.type,
          gifOptimizerResultSet.type,
          gifOptimizerClearAll.type,
        ],
        ignoredPaths: [
          "pdfMerger.items",
          "pdfRotate.item",
          "pdfRemovePages.item",
          "pdfSplit.item",
          "pdfLock.item",
          "imageToPdf.items",
          "imageCrop.item",
          "imageCrop.result",
          "imageFormatConverter.item",
          "imageFormatConverter.result",
          "imageFavicon.item",
          "imageFavicon.result",
          "imageGifOptimizer.item",
          "imageGifOptimizer.result",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
