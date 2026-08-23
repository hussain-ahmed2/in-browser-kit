"use client";

import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";

export interface SignerSettings {
  signatureImage: string | null;
  position: { x: number; y: number }; // 0 to 1 percentages
  scale: number;
}

export function useSignerPreview() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PDFDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(1);

  const [settings, setSettings] = useState<SignerSettings>({
    signatureImage: null,
    position: { x: 0.5, y: 0.5 }, // Center default
    scale: 0.5,
  });

  const loadFile = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      setPdfDoc(doc);
      setFile(selectedFile);
      setPageNumber(1);
      setNumPages(doc.getPageCount());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load PDF.");
      setFile(null);
    }
  };

  const updateSettings = useCallback((newSettings: Partial<SignerSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const savePdf = async () => {
    if (!file || !pdfDoc || !settings.signatureImage) return;

    setIsProcessing(true);
    try {
      // Re-load the original to ensure clean state
      const arrayBuffer = await file.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      
      const pngImage = await doc.embedPng(settings.signatureImage);
      const pngDims = pngImage.scale(settings.scale);

      const targetPage = doc.getPage(pageNumber - 1);
      const { width, height } = targetPage.getSize();

      // settings.position.x and y are percentages (0 to 1) from the top-left of the DOM preview.
      // pdf-lib's origin (0,0) is at the bottom-left of the page.
      // We also need to offset by half the signature's width/height since the DOM coordinates represent the center.
      const pdfX = (settings.position.x * width) - (pngDims.width / 2);
      const pdfY = ((1 - settings.position.y) * height) - (pngDims.height / 2);

      targetPage.drawImage(pngImage, {
        x: pdfX,
        y: pdfY,
        width: pngDims.width,
        height: pngDims.height,
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `signed_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Signed PDF downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    file,
    pageNumber,
    setPageNumber,
    numPages,
    settings,
    isProcessing,
    loadFile,
    updateSettings,
    savePdf,
    reset: () => setFile(null),
  };
}
