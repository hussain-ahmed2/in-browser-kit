"use client";

import { FileDropzone } from "@/components/FileDropzone";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, PenTool } from "lucide-react";
import { usePdfDocument } from "@/features/pdf-tools/lib/usePdfDocument";
import { SinglePagePreview } from "@/features/pdf-tools/components/SinglePagePreview";
import { useSignerPreview } from "../hooks/useSignerPreview";
import { SignerControls } from "./SignerControls";
import { SignaturePad } from "./SignaturePad";
import { DraggableOverlay } from "./DraggableOverlay";

export function PdfSignerPage() {
  const {
    file,
    pageNumber,
    setPageNumber,
    numPages,
    settings,
    isProcessing,
    loadFile,
    updateSettings,
    savePdf,
    reset,
  } = useSignerPreview();

  const { pdf: previewPdf, error: previewError } = usePdfDocument(file);
  const isGeneratingPreview = file !== null && previewPdf === null;

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Sign PDF</CardTitle>
        <CardDescription>
          Draw your signature and stamp it onto a specific page of your document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFiles={(files) => {
              if (files[0]) loadFile(files[0]);
            }}
            label="Click or drag and drop your PDF here"
          />
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-medium truncate">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Change File
              </Button>
            </div>

            {previewError && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                {previewError}
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* LEFT: Preview */}
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="relative bg-secondary/20 border border-border rounded-xl p-4 min-h-[400px] flex items-center justify-center">
                  {isGeneratingPreview && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-[2px] rounded-xl transition-all">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  )}

                  {previewPdf && (
                    <div className="relative w-full max-w-full mx-auto flex items-center justify-center p-2">
                      <SinglePagePreview
                        pdf={previewPdf}
                        pageNumber={pageNumber}
                      >
                        {settings.signatureImage && (
                          <DraggableOverlay
                            position={settings.position}
                            onChange={(pos) => updateSettings({ position: pos })}
                            scale={settings.scale}
                            imageSrc={settings.signatureImage}
                          />
                        )}
                      </SinglePagePreview>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center gap-4 bg-muted/30 p-2 rounded-lg border border-border">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    disabled={pageNumber === 1 || isGeneratingPreview}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium tabular-nums">
                    Page {pageNumber} of {numPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
                    disabled={pageNumber === numPages || isGeneratingPreview}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* RIGHT: Controls & Signature Pad */}
              <div className="w-full lg:w-[320px] shrink-0 space-y-6">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Draw Signature
                  </h3>
                  <SignaturePad
                    onSave={(dataUrl) => updateSettings({ signatureImage: dataUrl })}
                  />
                </div>

                <SignerControls
                  settings={settings}
                  onChange={updateSettings}
                  isProcessing={isProcessing}
                  onProcess={savePdf}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
