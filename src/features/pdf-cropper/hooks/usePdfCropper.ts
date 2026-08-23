"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { toast } from "sonner";
import { createPdfLoadingTask } from "@/features/pdf-tools/lib/preview";

export interface CropState {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface CropperProgress {
  status: "idle" | "cropping" | "done" | "error";
}

export function usePdfCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PDFDocumentProxy | null>(null);

  const [crop, setCrop] = useState<CropState>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  const [progress, setProgress] = useState<CropperProgress>({ status: "idle" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPreviewDoc(null);
    setFile(null);
    setPdfBytes(null);
    setCrop({ top: 0, bottom: 0, left: 0, right: 0 });
    setProgress({ status: "idle" });
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  }, [downloadUrl]);

  const loadFile = useCallback(
    async (newFile: File) => {
      reset();
      setFile(newFile);
      try {
        const arrayBuffer = await newFile.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        setPdfBytes(bytes);

        // Load preview for visuals
        const loadingTask = await createPdfLoadingTask(arrayBuffer);
        const doc = await loadingTask.promise;
        setPreviewDoc(doc);
      } catch {
        toast.error("Failed to read file.");
      }
    },
    [reset]
  );

  const cropPdf = useCallback(async () => {
    if (!file || !pdfBytes) return;

    setProgress({ status: "cropping" });

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();

        // Calculate absolute points from percentages
        // Note: pdf-lib uses a coordinate system where (0,0) is bottom-left!
        const x = (crop.left / 100) * width;
        const y = (crop.bottom / 100) * height;
        const cropWidth = width - ((crop.left / 100) * width) - ((crop.right / 100) * width);
        const cropHeight = height - ((crop.bottom / 100) * height) - ((crop.top / 100) * height);

        page.setCropBox(x, y, cropWidth, cropHeight);
      }

      const resultBytes = await pdfDoc.save();
      const blob = new Blob([resultBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setProgress({ status: "done" });
      toast.success("PDF cropped successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while cropping the PDF.");
      setProgress({ status: "error" });
    }
  }, [file, pdfBytes, crop]);

  return {
    file,
    previewDoc,
    crop,
    setCrop,
    progress,
    downloadUrl,
    loadFile,
    reset,
    cropPdf,
  };
}
