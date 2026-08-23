"use client";

import { useState, useEffect } from "react";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { usePdfDocument } from "@/features/pdf-tools/lib/usePdfDocument";
import { getWatermarkPosition, hexToRgb } from "../lib/watermark-math";

export interface WatermarkSettings {
  watermarkText: string;
  color: string;
  opacity: number;
  rotation: number;
  size: number;
  anchor: string;
}

export function useWatermarkPreview({
  originalPdfDoc,
  originalFile,
  currentPage,
  settings,
}: {
  originalPdfDoc: PDFDocument | null;
  originalFile: File | null;
  currentPage: number;
  settings: WatermarkSettings;
}) {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const { pdf: previewPdf, error: previewError } = usePdfDocument(previewFile);

  useEffect(() => {
    if (!originalPdfDoc || !originalFile) return;

    const timer = setTimeout(async () => {
      setIsGeneratingPreview(true);
      try {
        const previewDoc = await PDFDocument.create();
        const [copiedPage] = await previewDoc.copyPages(originalPdfDoc, [
          currentPage - 1,
        ]);
        previewDoc.addPage(copiedPage);

        // Apply watermark
        const helvetica = await previewDoc.embedFont(StandardFonts.Helvetica);
        const { width, height } = copiedPage.getSize();
        const textWidth = helvetica.widthOfTextAtSize(settings.watermarkText, settings.size);
        const textHeight = settings.size; // approximate height is font size

        const { x, y } = getWatermarkPosition({
          anchor: settings.anchor,
          pageWidth: width,
          pageHeight: height,
          textWidth,
          textHeight,
          rotation: settings.rotation,
        });

        copiedPage.drawText(settings.watermarkText, {
          x,
          y,
          size: settings.size,
          font: helvetica,
          color: hexToRgb(settings.color),
          rotate: degrees(settings.rotation),
          opacity: settings.opacity,
        });

        const bytes = await previewDoc.save();
        const blob = new Blob([bytes as unknown as BlobPart], {
          type: "application/pdf",
        });
        setPreviewFile(
          new File([blob], `preview_${currentPage}.pdf`, {
            type: "application/pdf",
          }),
        );
      } catch (err) {
        console.error("Preview generation error:", err);
      } finally {
        setIsGeneratingPreview(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentPage, settings, originalFile, originalPdfDoc]);

  const resetPreview = () => setPreviewFile(null);

  return { previewPdf, previewError, isGeneratingPreview, resetPreview };
}
