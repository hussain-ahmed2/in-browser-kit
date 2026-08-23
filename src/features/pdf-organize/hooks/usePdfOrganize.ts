"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { genId } from "@/lib/id";

export interface PdfPageItem {
  id: string;
  originalIndex: number;
}

export function usePdfOrganize() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPdfDoc, setOriginalPdfDoc] = useState<PDFDocument | null>(null);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadFile = async (file: File) => {
    setIsExtracting(true);
    setOriginalFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setOriginalPdfDoc(doc);
      
      const count = doc.getPageCount();
      const initialPages = Array.from({ length: count }, (_, i) => ({
        id: genId(),
        originalIndex: i,
      }));
      setPages(initialPages);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load PDF. It might be encrypted.");
      setOriginalFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const removePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reset = () => {
    setOriginalFile(null);
    setOriginalPdfDoc(null);
    setPages([]);
  };

  const savePdf = async () => {
    if (!originalPdfDoc || !originalFile || pages.length === 0) return;

    setIsProcessing(true);
    try {
      const newDoc = await PDFDocument.create();
      
      // pdf-lib copyPages might return pages in original order, 
      // or we might have duplicates if we ever allow duplicating pages.
      // Copy all unique required pages once to preserve shared resources.
      const uniqueIndices = Array.from(new Set(pages.map((p) => p.originalIndex)));
      const copiedPages = await newDoc.copyPages(originalPdfDoc, uniqueIndices);
      
      // Add them to the new document in the exact visual order
      pages.forEach((page) => {
        const copiedIndex = uniqueIndices.indexOf(page.originalIndex);
        if (copiedIndex !== -1) {
          newDoc.addPage(copiedPages[copiedIndex]);
        }
      });

      const pdfBytes = await newDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `organized_${originalFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF organized successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save the organized PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    originalFile,
    originalPdfDoc,
    pages,
    isExtracting,
    isProcessing,
    setPages,
    loadFile,
    removePage,
    reset,
    savePdf,
  };
}
