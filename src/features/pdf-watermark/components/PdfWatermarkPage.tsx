"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDropzone } from "@/components/FileDropzone";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { getWatermarkPosition, hexToRgb } from "../lib/watermark-math";
import { SinglePagePreview } from "./SinglePagePreview";
import { WatermarkControls } from "./WatermarkControls";
import { useWatermarkPreview, type WatermarkSettings } from "../hooks/useWatermarkPreview";

export function PdfWatermarkPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const originalPdfBytesRef = useRef<ArrayBuffer | null>(null);
  const [originalPdfDoc, setOriginalPdfDoc] = useState<PDFDocument | null>(null);
  
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [settings, setSettings] = useState<WatermarkSettings>({
    watermarkText: "CONFIDENTIAL",
    color: "#f21818",
    opacity: 0.3,
    rotation: 45,
    size: 40,
    anchor: "center",
  });

  const { previewPdf, previewError, isGeneratingPreview, resetPreview } = useWatermarkPreview({
    originalPdfDoc: originalPdfDoc,
    originalFile,
    currentPage,
    settings,
  });

  const handleFileSelect = async (files: File[]) => {
    const validFile = files.find((f) => f.type === "application/pdf");
    if (!validFile) {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setIsExtracting(true);
    try {
      const arrayBuffer = await validFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);

      originalPdfBytesRef.current = arrayBuffer;
      setOriginalPdfDoc(doc);
      setNumPages(doc.getPageCount());
      setCurrentPage(1);
      setOriginalFile(validFile);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read PDF. It might be encrypted.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleProcess = async () => {
    if (!originalFile || !originalPdfBytesRef.current) return;
    if (!settings.watermarkText.trim()) {
      toast.error("Please enter a watermark text.");
      return;
    }

    setIsProcessing(true);
    try {
      // Create a fresh doc to avoid mutating the preview cache
      const pdfDoc = await PDFDocument.load(originalPdfBytesRef.current);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = helvetica.widthOfTextAtSize(settings.watermarkText, settings.size);
        const textHeight = settings.size;

        const { x, y } = getWatermarkPosition({
          anchor: settings.anchor,
          pageWidth: width,
          pageHeight: height,
          textWidth,
          textHeight,
          rotation: settings.rotation,
        });

        page.drawText(settings.watermarkText, {
          x,
          y,
          size: settings.size,
          font: helvetica,
          color: hexToRgb(settings.color),
          rotate: degrees(settings.rotation),
          opacity: settings.opacity,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `watermarked_${originalFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Watermark applied successfully!");
    } catch (err) {
      console.error("Watermark error:", err);
      toast.error("Failed to apply watermark.");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalFile(null);
    resetPreview();
    originalPdfBytesRef.current = null;
    setOriginalPdfDoc(null);
  };

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Add Watermark to PDF</CardTitle>
        <CardDescription>
          Preview and stamp custom text across all pages of your PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!originalFile ? (
          isExtracting ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p>Loading PDF...</p>
            </div>
          ) : (
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFileSelect}
              label="Click or drag and drop your PDF here"
            />
          )
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
              <span className="font-medium truncate">{originalFile.name}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Change File
              </Button>
            </div>

            {previewError && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                {previewError}
              </div>
            )}

            {!previewError && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* PREVIEW PANE */}
                <div className="flex-1 w-full flex flex-col gap-4">
                  <div className="relative bg-secondary/20 border border-border rounded-xl p-4 min-h-100 flex items-center justify-center">
                    {isGeneratingPreview && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-xl transition-all">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {previewPdf ? (
                      <div className="w-full max-w-full mx-auto flex items-center justify-center p-2">
                        <SinglePagePreview pdf={previewPdf} pageNumber={1} />
                      </div>
                    ) : null}
                  </div>

                  {/* PAGINATION CONTROLS */}
                  <div className="flex items-center justify-between bg-card border border-border rounded-lg p-2 shadow-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <span className="text-sm font-medium tabular-nums">
                      Page {currentPage} of {numPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(numPages, p + 1))
                      }
                      disabled={currentPage === numPages}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>

                {/* CONTROLS PANE */}
                <WatermarkControls
                  settings={settings}
                  onChange={(newSettings) =>
                    setSettings((prev) => ({ ...prev, ...newSettings }))
                  }
                  isProcessing={isProcessing}
                  onProcess={handleProcess}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
