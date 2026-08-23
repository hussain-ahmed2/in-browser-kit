"use client";

import { useState, useEffect } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { usePdfDocument } from "@/features/pdf-tools/lib/usePdfDocument";
import { getWatermarkPosition, hexToRgb } from "@/features/pdf-tools/lib/position-math";

export interface PageNumberSettings {
  format: string; // e.g. "Page {n} of {total}"
  color: string;
  size: number;
  anchor: string;
  margin: number;
}

export function usePageNumbersPreview({
  originalPdfDoc,
  originalFile,
  currentPage,
  settings,
}: {
  originalPdfDoc: PDFDocument | null;
  originalFile: File | null;
  currentPage: number;
  settings: PageNumberSettings;
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

        // Apply page number
        const helvetica = await previewDoc.embedFont(StandardFonts.Helvetica);
        const { width, height } = copiedPage.getSize();
        const total = originalPdfDoc.getPageCount();
        const text = settings.format
          .replace(/{n}/g, currentPage.toString())
          .replace(/{total}/g, total.toString());
          
        const textWidth = helvetica.widthOfTextAtSize(text, settings.size);
        const textHeight = settings.size; // approximate height is font size

        const { x, y } = getWatermarkPosition({
          anchor: settings.anchor,
          pageWidth: width,
          pageHeight: height,
          textWidth,
          textHeight,
          rotation: 0,
          margin: settings.margin,
        });

        copiedPage.drawText(text, {
          x,
          y,
          size: settings.size,
          font: helvetica,
          color: hexToRgb(settings.color),
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
