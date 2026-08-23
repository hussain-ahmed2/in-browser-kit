"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { PdfResult } from "@/features/pdf-tools/components/PdfResult";
import { PdfUploader } from "@/features/pdf-tools/components/PdfUploader";
import { ArrowRight } from "lucide-react";
import { usePdfCompressor, formatFileSize } from "../hooks/usePdfCompressor";
import { CompressWorkspace } from "./CompressWorkspace";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

export function PdfCompressorPage() {
  const {
    file,
    originalSize,
    config,
    setConfig,
    progress,
    downloadUrl,
    resultSize,
    strategy,
    pageCount,
    renderProgress,
    loadFile,
    reset,
    compressPdf,
  } = usePdfCompressor();

  const currentStep = progress.status === "done" ? 2 : file ? 1 : 0;

  const savedPercent =
    resultSize && originalSize
      ? Math.round(((originalSize - resultSize) / originalSize) * 100)
      : 0;

  const strategyLabel = strategy === "lossless" ? "Lossless" : "Lossy";

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>PDF Compressor</CardTitle>
          <CardDescription>
            Reduce PDF file sizes locally. Everything happens on your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!file ? (
            <PdfUploader
              onFileSelect={loadFile}
              hint="Choose a PDF to compress"
            />
          ) : progress.status === "done" && downloadUrl ? (
            <PdfResult
              url={downloadUrl}
              title="Compression Complete!"
              description={
                resultSize ? (
                  <span className="flex items-center gap-1.5 flex-wrap">
                    {strategyLabel} compression: {formatFileSize(originalSize)}
                    <ArrowRight className="h-4 w-4 inline" />
                    {formatFileSize(resultSize)} ({savedPercent}% saved, {pageCount} pages)
                  </span>
                ) : (
                  "Your compressed PDF is ready to download."
                )
              }
              defaultFilename={`compressed_${file.name.replace(/\.pdf$/i, "")}`}
              buttonLabel="Download Compressed PDF"
              onStartOver={reset}
            />
          ) : (
            <CompressWorkspace
              file={file}
              originalSize={originalSize}
              config={config}
              isProcessing={progress.status === "compressing"}
              renderProgress={renderProgress}
              onConfigChange={setConfig}
              onClear={reset}
              onSubmit={compressPdf}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
