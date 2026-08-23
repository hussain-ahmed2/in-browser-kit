"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { StepIndicator } from "@/components/StepIndicator";
import { PdfResult } from "@/features/pdf-tools/components/PdfResult";
import { PdfUploader } from "@/features/pdf-tools/components/PdfUploader";
import { SinglePagePreview } from "@/features/pdf-tools/components/SinglePagePreview";
import { Crop, Loader2 } from "lucide-react";
import { usePdfCropper } from "../hooks/usePdfCropper";

const steps = [{ label: "Upload" }, { label: "Crop" }, { label: "Download" }];

export function PdfCropperPage() {
  const {
    file,
    previewDoc,
    crop,
    setCrop,
    progress,
    downloadUrl,
    loadFile,
    reset,
    cropPdf,
  } = usePdfCropper();

  const currentStep = progress.status === "done" ? 2 : file ? 1 : 0;

  // Validate to prevent overlapping crops (e.g. left + right > 100%)
  const handleCropChange = (key: keyof typeof crop, value: number) => {
    let newValue = value;
    if (key === "left" && value + crop.right >= 95) newValue = 95 - crop.right;
    if (key === "right" && value + crop.left >= 95) newValue = 95 - crop.left;
    if (key === "top" && value + crop.bottom >= 95) newValue = 95 - crop.bottom;
    if (key === "bottom" && value + crop.top >= 95) newValue = 95 - crop.top;

    setCrop((prev) => ({ ...prev, [key]: newValue }));
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>PDF Cropper</CardTitle>
          <CardDescription>
            Visually trim the margins of your PDF. The crop is applied evenly to
            all pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!file ? (
            <PdfUploader onFileSelect={loadFile} hint="Choose a PDF to crop" />
          ) : progress.status === "done" && downloadUrl ? (
            <PdfResult
              url={downloadUrl}
              title="Crop Complete!"
              description="Your cropped PDF is ready to download."
              defaultFilename={`cropped_${file.name.replace(/\.pdf$/i, "")}`}
              buttonLabel="Download Cropped PDF"
              onStartOver={reset}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              {progress.status === "idle" && (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                  {/* Visual Preview */}
                  <div className="w-full lg:w-1/2 flex justify-center bg-muted/20 border border-border p-6 rounded-xl min-h-100">
                    {previewDoc ? (
                      <div className="relative inline-block shadow-lg rounded-sm overflow-hidden select-none">
                        <SinglePagePreview pdf={previewDoc} pageNumber={1} />

                        {/* Visual Crop Overlay mask */}
                        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                          <div
                            className="absolute border-2 border-brand ring-4 ring-brand/20 transition-all duration-100 ease-out"
                            style={{
                              top: `${crop.top}%`,
                              bottom: `${crop.bottom}%`,
                              left: `${crop.left}%`,
                              right: `${crop.right}%`,
                              boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                            }}
                          >
                            {/* Corner markers for aesthetic */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-brand rounded-full" />
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-brand rounded-full" />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-brand rounded-full" />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-brand rounded-full" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="w-full lg:w-1/2 space-y-8 p-6 bg-card border border-border rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 border-b border-border pb-4">
                      <div className="p-2 bg-brand/10 text-brand rounded-md">
                        <Crop className="w-5 h-5" />
                      </div>
                      <h3 className="font-medium text-lg">Crop Margins</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Top Margin</Label>
                          <span className="text-xs text-muted-foreground font-mono">
                            {crop.top}%
                          </span>
                        </div>
                        <Slider
                          value={[crop.top]}
                          max={50}
                          step={1}
                          onValueChange={([val]) => handleCropChange("top", val)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Bottom Margin</Label>
                          <span className="text-xs text-muted-foreground font-mono">
                            {crop.bottom}%
                          </span>
                        </div>
                        <Slider
                          value={[crop.bottom]}
                          max={50}
                          step={1}
                          onValueChange={([val]) =>
                            handleCropChange("bottom", val)
                          }
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Left Margin</Label>
                          <span className="text-xs text-muted-foreground font-mono">
                            {crop.left}%
                          </span>
                        </div>
                        <Slider
                          value={[crop.left]}
                          max={50}
                          step={1}
                          onValueChange={([val]) => handleCropChange("left", val)}
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Label>Right Margin</Label>
                          <span className="text-xs text-muted-foreground font-mono">
                            {crop.right}%
                          </span>
                        </div>
                        <Slider
                          value={[crop.right]}
                          max={50}
                          step={1}
                          onValueChange={([val]) =>
                            handleCropChange("right", val)
                          }
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={reset} className="flex-1">
                        Change File
                      </Button>
                      <Button size="lg" className="flex-1" onClick={cropPdf}>
                        <Crop className="w-4 h-4 mr-2" />
                        Apply Crop
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {progress.status === "cropping" && (
                <div className="flex flex-col items-center justify-center p-12 border border-border rounded-xl bg-card shadow-sm text-center space-y-4 max-w-xl mx-auto">
                  <Loader2 className="w-10 h-10 animate-spin text-brand" />
                  <h3 className="text-lg font-medium">Cropping PDF...</h3>
                  <p className="text-sm text-muted-foreground">
                    Modifying bounding boxes for all pages...
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
