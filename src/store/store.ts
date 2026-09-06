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
import imageDropShadowReducer, {
  fileSelected as dropShadowFileSelected,
  resultSet as dropShadowResultSet,
  clearAll as dropShadowClearAll,
} from "@/features/image-drop-shadow/dropShadowSlice";
import imageBorderReducer, {
  fileSelected as borderFileSelected,
  resultSet as borderResultSet,
  clearAll as borderClearAll,
} from "@/features/image-border/borderSlice";
import imageOverlayReducer, {
  baseFileSelected as overlayBaseFileSelected,
  overlayFileSelected as overlayOverlayFileSelected,
  resultSet as overlayResultSet,
  clearAll as overlayClearAll,
} from "@/features/image-overlay/overlaySlice";
import imageComparatorReducer, {
  imageASelected as comparatorImageASelected,
  imageBSelected as comparatorImageBSelected,
  resultSet as comparatorResultSet,
  clearAll as comparatorClearAll,
} from "@/features/image-comparator/comparatorSlice";
import imageHistogramReducer, {
  fileSelected as histogramFileSelected,
  clearAll as histogramClearAll,
} from "@/features/image-histogram/histogramSlice";
import imageCollageReducer, {
  filesAdded as collageFilesAdded,
  fileRemoved as collageFileRemoved,
  resultSet as collageResultSet,
  clearAll as collageClearAll,
} from "@/features/image-collage/collageSlice";
import imageAnnotateReducer, {
  fileSelected as annotateFileSelected,
  annotationAdded as annotateAnnotationAdded,
  clearAll as annotateClearAll,
} from "@/features/image-annotate/annotateSlice";
import imageSocialResizerReducer, {
  fileSelected as socialResizerFileSelected,
  resultSet as socialResizerResultSet,
  clearAll as socialResizerClearAll,
} from "@/features/image-social-resizer/socialResizerSlice";
import imageProfilePicReducer, {
  fileSelected as profilePicFileSelected,
  resultSet as profilePicResultSet,
  clearAll as profilePicClearAll,
} from "@/features/image-profile-pic/profilePicSlice";
import imageMemeReducer, {
  fileSelected as memeFileSelected,
  resultSet as memeResultSet,
  clearAll as memeClearAll,
} from "@/features/image-meme/memeSlice";
import imageQrReaderReducer, {
  fileSelected as qrReaderFileSelected,
  clearAll as qrReaderClearAll,
} from "@/features/image-qr-reader/qrReaderSlice";
import imageBarcodeReducer, {
  clearAll as barcodeClearAll,
} from "@/features/image-barcode/barcodeSlice";
import imageExifStripperReducer, {
  fileSelected as exifStripperFileSelected,
  resultSet as exifStripperResultSet,
  clearAll as exifStripperClearAll,
} from "@/features/image-exif-stripper/exifStripperSlice";
import imageCssSpriteReducer, {
  filesAdded as cssSpriteFilesAdded,
  fileRemoved as cssSpriteFileRemoved,
  clearAll as cssSpriteClearAll,
} from "@/features/image-css-sprite/cssSpriteSlice";
import imageHtmlToImageReducer, {
  clearAll as htmlToImageClearAll,
} from "@/features/image-html-to-image/htmlToImageSlice";
import imageLazyPlaceholderReducer, {
  fileSelected as lazyPlaceholderFileSelected,
  resultSet as lazyPlaceholderResultSet,
  clearAll as lazyPlaceholderClearAll,
} from "@/features/image-lazy-placeholder/lazyPlaceholderSlice";
import asciiReducer, {
  fileSelected as asciiFileSelected,
  resultSet as asciiResultSet,
  clearAll as asciiClearAll,
} from "@/features/image-ascii/asciiSlice";
import steganographyReducer, {
  fileSelected as steganographyFileSelected,
  encodeResultSet as steganographyEncodeResultSet,
  clearAll as steganographyClearAll,
} from "@/features/image-steganography/steganographySlice";
import ocrReducer, {
  fileSelected as ocrFileSelected,
  resultSet as ocrResultSet,
  clearAll as ocrClearAll,
} from "@/features/image-ocr/ocrSlice";
import aiUpscalerReducer, {
  fileSelected as aiUpscalerFileSelected,
  resultSet as aiUpscalerResultSet,
  clearAll as aiUpscalerClearAll,
} from "@/features/image-ai-upscaler/aiUpscalerSlice";
import imageHeicConverterReducer, {
  fileSelected as heicConverterFileSelected,
  resultSet as heicConverterResultSet,
  clearAll as heicConverterClearAll,
} from "@/features/heic-converter/heicConverterSlice";
import imageColorPaletteReducer, {
  fileSelected as colorPaletteFileSelected,
  paletteSet as colorPalettePaletteSet,
  clearAll as colorPaletteClearAll,
} from "@/features/color-palette/colorPaletteSlice";
import wordCounterReducer from "@/features/word-counter/wordCounterSlice";
import caseConverterReducer from "@/features/case-converter/caseConverterSlice";
import loremIpsumReducer from "@/features/lorem-ipsum/loremIpsumSlice";
import markdownPreviewReducer from "@/features/markdown-preview/markdownPreviewSlice";
import xmlBeautifierReducer from "@/features/xml-beautifier/xmlBeautifierSlice";
import cssMinifierReducer from "@/features/css-minifier/cssMinifierSlice";
import cronGeneratorReducer from "@/features/cron-generator/cronGeneratorSlice";
import jsonCsvReducer from "@/features/json-csv/jsonCsvSlice";
import ipLookupReducer from "@/features/ip-lookup/ipLookupSlice";
import dnsLookupReducer from "@/features/dns-lookup/dnsLookupSlice";
import httpHeadersReducer from "@/features/http-headers/httpHeadersSlice";
import portScannerReducer from "@/features/port-scanner/portScannerSlice";

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
    imageDropShadow: imageDropShadowReducer,
    imageBorder: imageBorderReducer,
    imageOverlay: imageOverlayReducer,
    imageComparator: imageComparatorReducer,
    imageHistogram: imageHistogramReducer,
    imageCollage: imageCollageReducer,
    imageAnnotate: imageAnnotateReducer,
    imageSocialResizer: imageSocialResizerReducer,
    imageProfilePic: imageProfilePicReducer,
    imageMeme: imageMemeReducer,
    imageQrReader: imageQrReaderReducer,
    imageBarcode: imageBarcodeReducer,
    imageExifStripper: imageExifStripperReducer,
    imageCssSprite: imageCssSpriteReducer,
    imageHtmlToImage: imageHtmlToImageReducer,
    imageLazyPlaceholder: imageLazyPlaceholderReducer,
    ascii: asciiReducer,
    steganography: steganographyReducer,
    ocr: ocrReducer,
    aiUpscaler: aiUpscalerReducer,
    imageHeicConverter: imageHeicConverterReducer,
    imageColorPalette: imageColorPaletteReducer,
    wordCounter: wordCounterReducer,
    caseConverter: caseConverterReducer,
    loremIpsum: loremIpsumReducer,
    markdownPreview: markdownPreviewReducer,
    xmlBeautifier: xmlBeautifierReducer,
    cssMinifier: cssMinifierReducer,
    cronGenerator: cronGeneratorReducer,
    jsonCsv: jsonCsvReducer,
    ipLookup: ipLookupReducer,
    dnsLookup: dnsLookupReducer,
    httpHeaders: httpHeadersReducer,
    portScanner: portScannerReducer,
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
          dropShadowFileSelected.type,
          dropShadowResultSet.type,
          dropShadowClearAll.type,
          borderFileSelected.type,
          borderResultSet.type,
          borderClearAll.type,
          overlayBaseFileSelected.type,
          overlayOverlayFileSelected.type,
          overlayResultSet.type,
          overlayClearAll.type,
          comparatorImageASelected.type,
          comparatorImageBSelected.type,
          comparatorResultSet.type,
          comparatorClearAll.type,
          histogramFileSelected.type,
          histogramClearAll.type,
          collageFilesAdded.type,
          collageFileRemoved.type,
          collageResultSet.type,
          collageClearAll.type,
          annotateFileSelected.type,
          annotateAnnotationAdded.type,
          annotateClearAll.type,
          socialResizerFileSelected.type,
          socialResizerResultSet.type,
          socialResizerClearAll.type,
          profilePicFileSelected.type,
          profilePicResultSet.type,
          profilePicClearAll.type,
          memeFileSelected.type,
          memeResultSet.type,
          memeClearAll.type,
          qrReaderFileSelected.type,
          qrReaderClearAll.type,
          barcodeClearAll.type,
          exifStripperFileSelected.type,
          exifStripperResultSet.type,
          exifStripperClearAll.type,
          cssSpriteFilesAdded.type,
          cssSpriteFileRemoved.type,
          cssSpriteClearAll.type,
          htmlToImageClearAll.type,
          lazyPlaceholderFileSelected.type,
          lazyPlaceholderResultSet.type,
          lazyPlaceholderClearAll.type,
          asciiFileSelected.type,
          asciiResultSet.type,
          asciiClearAll.type,
          steganographyFileSelected.type,
          steganographyEncodeResultSet.type,
          steganographyClearAll.type,
          ocrFileSelected.type,
          ocrResultSet.type,
          ocrClearAll.type,
          aiUpscalerFileSelected.type,
          aiUpscalerResultSet.type,
          aiUpscalerClearAll.type,
          heicConverterFileSelected.type,
          heicConverterResultSet.type,
          heicConverterClearAll.type,
          colorPaletteFileSelected.type,
          colorPalettePaletteSet.type,
          colorPaletteClearAll.type,
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
          "imageDropShadow.item",
          "imageDropShadow.result",
          "imageBorder.item",
          "imageBorder.result",
          "imageOverlay.baseItem",
          "imageOverlay.overlayItem",
          "imageOverlay.result",
          "imageComparator.imageA",
          "imageComparator.imageB",
          "imageHistogram.item",
          "imageCollage.items",
          "imageCollage.result",
          "imageAnnotate.item",
          "imageAnnotate.result",
          "imageSocialResizer.item",
          "imageSocialResizer.result",
          "imageProfilePic.item",
          "imageProfilePic.result",
          "imageMeme.item",
          "imageMeme.result",
          "imageQrReader.item",
          "imageExifStripper.item",
          "imageExifStripper.result",
          "imageCssSprite.items",
          "imageCssSprite.result",
          "imageLazyPlaceholder.item",
          "imageLazyPlaceholder.result",
          "ascii.item",
          "ascii.result",
          "steganography.item",
          "steganography.result",
          "ocr.item",
          "ocr.result",
          "aiUpscaler.item",
          "aiUpscaler.result",
          "imageHeicConverter.item",
          "imageHeicConverter.result",
          "imageColorPalette.item",
          "imageColorPalette.palette",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
