"use client";

import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Loader2, Crop, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import { cropImage, getImageDimensions, ASPECT_RATIOS } from "../lib/imageCrop";
import {
  fileSelected,
  cropAreaSet,
  processingSet,
  resultSet,
  clearAll,
} from "../cropSlice";
import { CropToolbar } from "./CropToolbar";
import { CropCanvas } from "./CropCanvas";
import { CropResult } from "./CropResult";

const steps = [{ label: "Upload" }, { label: "Crop" }, { label: "Download" }];

export function ImageCropPage() {
  const dispatch = useAppDispatch();
  const {
    item,
    dims,
    cropArea,
    gridType,
    aspectRatio,
    customRatio,
    result,
    isProcessing,
  } = useAppSelector((state) => state.imageCrop);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;

      const previewUrl = URL.createObjectURL(selected);
      try {
        const d = await getImageDimensions(selected);
        dispatch(fileSelected({ file: selected, previewUrl, dims: d }));
      } catch {
        toast.error("Could not read image dimensions");
        URL.revokeObjectURL(previewUrl);
      }
    },
    [dispatch],
  );

  const handleClear = useCallback(() => {
    dispatch(clearAll());
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!cropArea || !dims) return;
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
        return;

      const step = e.shiftKey ? 10 : 1;
      let { x, y, width, height } = cropArea;
      let changed = false;

      switch (e.key) {
        case "ArrowLeft":
          x = Math.max(0, x - step);
          changed = true;
          break;
        case "ArrowRight":
          x = Math.min(dims.width - width, x + step);
          changed = true;
          break;
        case "ArrowUp":
          y = Math.max(0, y - step);
          changed = true;
          break;
        case "ArrowDown":
          y = Math.min(dims.height - height, y + step);
          changed = true;
          break;
        case "[":
          width = Math.max(1, width - step);
          height = Math.max(1, height - step);
          changed = true;
          break;
        case "]":
          width = Math.min(dims.width - x, width + step);
          height = Math.min(dims.height - y, height + step);
          changed = true;
          break;
      }

      if (changed) {
        dispatch(cropAreaSet({ x, y, width, height }));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cropArea, dims, aspectRatio, customRatio, dispatch]);

  const handleCrop = async () => {
    if (!item || !cropArea || cropArea.width < 1 || cropArea.height < 1) return;
    dispatch(processingSet(true));
    try {
      const res = await cropImage(item.file, cropArea);
      dispatch(resultSet(res));
      toast.success("Image cropped successfully!");
    } catch {
      toast.error("Error cropping image");
      dispatch(processingSet(false));
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.objectUrl;
    a.download = result.file.name;
    a.click();
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={result ? 2 : item ? 1 : 0} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop />
            Image Crop
          </CardTitle>
          <CardDescription>
            Visually crop with handles, presets, live preview & grid guides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              <CropToolbar />

              <div className="space-y-4">
                  <CropCanvas
                    previewUrl={item.previewUrl}
                    cropArea={cropArea}
                    dims={dims}
                    gridType={gridType}
                    aspectRatio={aspectRatio === 'custom' ? parseFloat(customRatio) || null : ASPECT_RATIOS[aspectRatio]}
                    onCropAreaChange={(area) => dispatch(cropAreaSet(area))}
                  />

                  {cropArea && cropArea.width > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Selection: {Math.round(cropArea.width)}×
                      {Math.round(cropArea.height)} px
                      {dims && ` • Image: ${dims.width}×${dims.height}`}
                    </p>
                  )}

                  <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <Button
                      onClick={handleCrop}
                      disabled={
                        isProcessing ||
                        !cropArea ||
                        cropArea.width < 1 ||
                        cropArea.height < 1
                      }
                      className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Cropping...
                        </>
                      ) : (
                        <>
                          <Crop aria-hidden="true" />
                          Crop Image
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      <RotateCcw />
                      Reset
                    </Button>
                  </div>
                </div>

              {result && (
                <CropResult result={result} onDownload={handleDownload} />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
