"use client";

import { useRef, useEffect } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { renderPageThumbnail } from "@/features/pdf-tools/lib/preview";

export function SinglePagePreview({
  pdf,
  pageNumber,
}: {
  pdf: PDFDocumentProxy;
  pageNumber: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Use the native pdf fingerprint as a stable, pure key to force a new canvas element.
  // This completely prevents pdf.js "Cannot use the same canvas during multiple render() operations"
  const pdfKey = pdf.fingerprints?.[0] || "fallback-key";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // In React Strict Mode, this useEffect will fire twice for the same canvas element.
    // pdf.js throws an error if two renders hit the exact same canvas element concurrently.
    // We lock the canvas element using dataset to avoid 'any' types.
    if (canvas.dataset.isRendering === "true") return;
    canvas.dataset.isRendering = "true";

    let active = true;

    renderPageThumbnail(pdf, pageNumber, canvas, { maxWidth: 1200 })
      .catch((err) => {
        if (active && err?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      })
      .finally(() => {
        canvas.dataset.isRendering = "false";
      });

    return () => {
      active = false;
    };
  }, [pdf, pageNumber, pdfKey]);

  return (
    <canvas
      key={pdfKey}
      ref={canvasRef}
      className="w-full h-auto max-h-150 object-contain rounded shadow-sm bg-white"
      aria-label="PDF Preview"
    />
  );
}
