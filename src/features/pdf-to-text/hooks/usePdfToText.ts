"use client";

import { useState, useCallback } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { toast } from "sonner";
import { extractTextFromPdfDoc } from "../lib/extractText";

export interface ExtractionProgress {
  status: "idle" | "scanning" | "done" | "error";
  currentPage: number;
  totalPages: number;
}

export function usePdfToText() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [progress, setProgress] = useState<ExtractionProgress>({
    status: "idle",
    currentPage: 0,
    totalPages: 0,
  });

  const reset = useCallback(() => {
    setFile(null);
    setPdfDoc(null);
    setExtractedText("");
    setProgress({ status: "idle", currentPage: 0, totalPages: 0 });
  }, []);

  const loadFile = useCallback(
    async (newFile: File) => {
      reset();
      setFile(newFile);
      try {
        const arrayBuffer = await newFile.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist");
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }
        const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPdfDoc(doc);
      } catch (err) {
        console.error(err);
        toast.error("Failed to parse PDF document.");
      }
    },
    [reset]
  );

  const extractText = useCallback(async () => {
    if (!file || !pdfDoc) return;

    setProgress((p) => ({ ...p, status: "scanning", currentPage: 0 }));

    try {
      const totalPages = pdfDoc.numPages;
      setProgress((p) => ({ ...p, totalPages }));

      for (let i = 1; i <= totalPages; i++) {
        setProgress((p) => ({ ...p, currentPage: i }));
      }
      const fullText = await extractTextFromPdfDoc(pdfDoc);

      if (!fullText) {
        toast.info("No extractable text found in this document. It might be a scanned image.");
      } else {
        toast.success("Text extracted successfully!");
      }

      setExtractedText(fullText);
      setProgress((p) => ({ ...p, status: "done" }));
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while extracting text.");
      setProgress((p) => ({ ...p, status: "error" }));
    }
  }, [file, pdfDoc]);

  const downloadTextFile = useCallback(() => {
    if (!extractedText || !file) return;
    const blob = new Blob([extractedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file.name.replace(/\.[^/.]+$/, "")}-extracted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [extractedText, file]);

  return {
    file,
    pdfDoc,
    progress,
    extractedText,
    setExtractedText,
    loadFile,
    reset,
    extractText,
    downloadTextFile,
  };
}
