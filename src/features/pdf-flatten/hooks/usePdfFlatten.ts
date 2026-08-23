"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

export interface FlattenProgress {
  status: "idle" | "flattening" | "done" | "error";
}

export function usePdfFlatten() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [progress, setProgress] = useState<FlattenProgress>({ status: "idle" });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const reset = useCallback(() => {
    setFile(null);
    setPdfBytes(null);
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
        setPdfBytes(new Uint8Array(arrayBuffer));
      } catch (err) {
        toast.error("Failed to read file.");
      }
    },
    [reset]
  );

  const flattenPdf = useCallback(async () => {
    if (!file || !pdfBytes) return;

    setProgress({ status: "flattening" });

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      
      const form = pdfDoc.getForm();
      form.flatten();
      
      const resultBytes = await pdfDoc.save();
      const blob = new Blob([resultBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      setProgress({ status: "done" });
      toast.success("PDF flattened successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while flattening the PDF.");
      setProgress({ status: "error" });
    }
  }, [file, pdfBytes]);

  return {
    file,
    progress,
    downloadUrl,
    loadFile,
    reset,
    flattenPdf,
  };
}
