"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { createPdfLoadingTask } from "@/features/pdf-tools/lib/preview";

export interface CompressConfig {
  mode: "lossless" | "lossy" | "smart";
  quality: number;
  scale: number;
}

export interface CompressProgress {
  status: "idle" | "compressing" | "done" | "error";
}

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  strategy: "lossless" | "lossy";
  pageCount: number;
}

const defaultConfig: CompressConfig = {
  mode: "smart",
  quality: 0.7,
  scale: 1.5,
};

/**
 * Lossless: re-save with object streams to pack objects more efficiently.
 * Source: pdf-lib save() with useObjectStreams=true
 * https://github.com/Hopding/pdf-lib/blob/master/src/api/PDFDocument.ts
 */
async function compressLossless(input: ArrayBuffer): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(input, { ignoreEncryption: true });
  return await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
}

/**
 * Lossy: render each page to canvas, re-encode as JPEG, rebuild PDF.
 * Source: Ultimate Tools, QuickTools.one production approach
 * https://dev.to/shaishav_patel_271fdcd61a/compress-pdf-in-the-browser-without-a-server-how-it-works-pdf-lib-web-workers-14pb
 */
async function compressLossy(
  input: ArrayBuffer,
  quality: number,
  scale: number,
  onProgress?: (current: number, total: number) => void
): Promise<{ bytes: Uint8Array; pageCount: number }> {
  // Load with pdfjs-dist for rendering
  const loadingTask = await createPdfLoadingTask(input.slice(0));
  const pdfjsDoc = await loadingTask.promise;
  const numPages = pdfjsDoc.numPages;

  const newPdfDoc = await PDFDocument.create();

  for (let i = 1; i <= numPages; i++) {
    onProgress?.(i, numPages);

    const page = await pdfjsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    // Render to canvas
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    await page.render({ canvas, viewport }).promise;

    // Export as JPEG
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
        "image/jpeg",
        quality
      );
    });

    const imgBytes = new Uint8Array(await blob.arrayBuffer());
    const jpgImage = await newPdfDoc.embedJpg(imgBytes);

    const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
    newPage.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: viewport.width,
      height: viewport.height,
    });

    // Cleanup
    canvas.width = 0;
    canvas.height = 0;
  }

  const bytes = await newPdfDoc.save({ useObjectStreams: true });
  return { bytes, pageCount: numPages };
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function usePdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [config, setConfig] = useState<CompressConfig>(defaultConfig);
  const [progress, setProgress] = useState<CompressProgress>({ status: "idle" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [strategy, setStrategy] = useState<"lossless" | "lossy" | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [renderProgress, setRenderProgress] = useState<{ current: number; total: number } | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setOriginalSize(0);
    setConfig(defaultConfig);
    setProgress({ status: "idle" });
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultSize(null);
    setStrategy(null);
    setPageCount(0);
    setRenderProgress(null);
  }, [downloadUrl]);

  const loadFile = useCallback(
    async (newFile: File) => {
      reset();
      setFile(newFile);
      setOriginalSize(newFile.size);
    },
    [reset]
  );

  const compressPdf = useCallback(async () => {
    if (!file) return;

    setProgress({ status: "compressing" });
    setRenderProgress(null);

    try {
      const input = await file.arrayBuffer();
      let resultBytes: Uint8Array;
      let usedStrategy: "lossless" | "lossy";
      let pages: number;

      if (config.mode === "lossless") {
        resultBytes = await compressLossless(input);
        usedStrategy = "lossless";
        const doc = await PDFDocument.load(input, { ignoreEncryption: true });
        pages = doc.getPageCount();
      } else if (config.mode === "lossy") {
        const result = await compressLossy(input, config.quality, config.scale, (current, total) => {
          setRenderProgress({ current, total });
        });
        resultBytes = result.bytes;
        usedStrategy = "lossy";
        pages = result.pageCount;
      } else {
        // Smart: try lossless first, then lossy if not enough savings
        const losslessBytes = await compressLossless(input);
        const losslessRatio = losslessBytes.length / input.byteLength;

        if (losslessRatio < 0.8) {
          // Lossless saved at least 20%, use it
          resultBytes = losslessBytes;
          usedStrategy = "lossless";
          const doc = await PDFDocument.load(input, { ignoreEncryption: true });
          pages = doc.getPageCount();
        } else {
          // Lossless didn't help much, try lossy
          const lossyResult = await compressLossy(input, config.quality, config.scale, (current, total) => {
            setRenderProgress({ current, total });
          });
          resultBytes = lossyResult.bytes;
          usedStrategy = "lossy";
          pages = lossyResult.pageCount;
        }
      }

      // If compressed is larger, return original
      if (resultBytes.length >= input.byteLength) {
        resultBytes = new Uint8Array(input);
      }

      const blob = new Blob([resultBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setDownloadUrl(url);
      setResultSize(resultBytes.length);
      setStrategy(usedStrategy);
      setPageCount(pages);
      setProgress({ status: "done" });
      setRenderProgress(null);
      toast.success("PDF compressed successfully!");
    } catch (error: unknown) {
      console.error("[pdf-compressor] error:", error);
      toast.error("An error occurred while compressing the PDF.");
      setProgress({ status: "error" });
      setRenderProgress(null);
    }
  }, [file, config]);

  return {
    file,
    originalSize,
    config,
    setConfig,
    progress,
    downloadUrl,
    resultSize,
    strategy,
    pageCount,
    renderProgress,
    loadFile,
    reset,
    compressPdf,
  };
}
