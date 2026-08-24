"use client";

import { useState, useCallback, useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Download,
  RotateCcw,
  ImageIcon,
  Square,
  CheckCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/components/form/input-field";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import {
  generateFavicon,
  createZip,
  FAVICON_SIZES,
  formatBytes,
  getImageDimensions,
  type FaviconSize,
} from "../lib/imageFavicon";
import { faviconSchema, type FaviconFormValues } from "../types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fileSelected,
  optionsSet,
  resultSet,
  processingSet,
  clearAll,
} from "../faviconSlice";

const steps = [
  { label: "Upload" },
  { label: "Configure" },
  { label: "Download" },
];

export function ImageFaviconPage() {
  const dispatch = useAppDispatch();
  const { item, dimensions, result, isProcessing } = useAppSelector(
    (state) => state.imageFavicon,
  );

  const currentStep = result ? 2 : item ? 1 : 0;

  const form = useForm<FaviconFormValues>({
    resolver: zodResolver(faviconSchema),
    defaultValues: {
      mode: "pad",
      backgroundColor: "#ffffff",
      selectedSizes: [16, 32, 48, 64, 128, 256, 512, 180, 192, 512],
    },
    mode: "onChange",
  });

  const watchedMode = useWatch({ control: form.control, name: "mode" });
  const watchedBgColor = useWatch({
    control: form.control,
    name: "backgroundColor",
  });
  const watchedSizes = useWatch({
    control: form.control,
    name: "selectedSizes",
  });

  const [selectedSizes, setSelectedSizes] = useState<number[]>([
    16, 32, 48, 64, 128, 256, 512, 180, 192, 512,
  ]);

  useEffect(() => {
    dispatch(
      optionsSet({
        mode: watchedMode,
        backgroundColor: watchedBgColor,
        selectedSizes: watchedSizes ?? selectedSizes,
      }),
    );
  }, [watchedMode, watchedBgColor, watchedSizes, dispatch, selectedSizes]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      const previewUrl = URL.createObjectURL(selected);
      try {
        const d = await getImageDimensions(selected);
        dispatch(fileSelected({ file: selected, previewUrl, dimensions: d }));
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

  const handleGenerate = async () => {
    if (!item) return;
    dispatch(processingSet(true));
    try {
      const res = await generateFavicon(item.file, {
        mode: watchedMode ?? "pad",
        backgroundColor: watchedBgColor ?? "#ffffff",
        selectedSizes: watchedSizes ?? selectedSizes,
      });
      dispatch(resultSet(res));
      toast.success("Favicon generated successfully!");
    } catch {
      toast.error("Error generating favicon");
      dispatch(processingSet(false));
    }
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    dispatch(processingSet(true));
    try {
      const zipBlob = await createZip(
        result.pngs,
        result.icoBlob,
        result.manifestJson,
      );
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "favicon-package.zip";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("ZIP downloaded!");
    } catch {
      toast.error("Error creating ZIP");
    } finally {
      dispatch(processingSet(false));
    }
  };

  const handleDownloadICO = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.icoDataUrl;
    a.download = "favicon.ico";
    a.click();
  };

  const handleDownloadPNG = (size: FaviconSize) => {
    if (!result) return;
    const png = result.pngs.find(
      (p) => p.size.width === size.width && p.size.height === size.height,
    );
    if (!png) return;
    const a = document.createElement("a");
    a.href = png.dataUrl;
    a.download = `icon-${size.width}.png`;
    a.click();
  };

  const toggleSize = (size: number) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(newSizes);
    form.setValue("selectedSizes", newSizes);
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon />
            Favicon Generator
          </CardTitle>
          <CardDescription>
            Create multi-size favicons and apple-touch-icons from any image.
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
              <FormProvider {...form}>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mode
                    </label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={watchedMode === "crop" ? "default" : "outline"}
                        size="sm"
                        onClick={() => form.setValue("mode", "crop")}
                      >
                        <Square className="mr-1" />
                        Crop to Square
                      </Button>
                      <Button
                        type="button"
                        variant={watchedMode === "pad" ? "default" : "outline"}
                        size="sm"
                        onClick={() => form.setValue("mode", "pad")}
                      >
                        <Square className="mr-1" />
                        Pad with Background
                      </Button>
                      <Button
                        type="button"
                        variant={
                          watchedMode === "transparent" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => form.setValue("mode", "transparent")}
                      >
                        <Square className="mr-1" />
                        Transparent
                      </Button>
                    </div>
                  </div>

                  {watchedMode === "pad" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Background Color
                      </label>
                      <InputField
                        name="backgroundColor"
                        label=""
                        type="color"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sizes to Generate (
                      {watchedSizes?.length ?? selectedSizes.length})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FAVICON_SIZES.map((size) => {
                        const isSelected = (
                          watchedSizes ?? selectedSizes
                        ).includes(size.width);
                        return (
                          <Button
                            key={size.id}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            className="min-w-0"
                            onClick={() => toggleSize(size.width)}
                          >
                            <div className="flex items-center gap-1">
                              {isSelected && <CheckCheck className="size-3" />}
                              {size.label}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={handleGenerate}
                      disabled={isProcessing}
                      className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <ImageIcon aria-hidden="true" />
                          Generate Favicons
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </FormProvider>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleDownloadZip}
                        className="flex-1 sm:flex-none"
                      >
                        <Download aria-hidden="true" />
                        Download ZIP (All)
                      </Button>
                      <Button
                        onClick={handleDownloadICO}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        <ImageIcon aria-hidden="true" />
                        Download ICO
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto">
                      {FAVICON_SIZES.filter((s) =>
                        (watchedSizes ?? selectedSizes).includes(s.width),
                      ).map((size) => {
                        const png = result.pngs.find(
                          (p) => p.size.id === size.id,
                        );
                        return (
                          <div
                            key={size.id}
                            className="p-3 rounded-lg bg-secondary/50 border border-border text-center"
                          >
                            <div className="w-16 h-16 mx-auto mb-2 rounded bg-white/50 border border-border flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={png?.dataUrl ?? ""}
                                alt={size.label}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs font-medium">{size.label}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatBytes(png?.blob.size ?? 0)}
                            </p>
                            {png && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-1"
                                onClick={() => handleDownloadPNG(size)}
                              >
                                <Download aria-hidden="true" className="mr-1" />
                                PNG
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1"
                    >
                      <RotateCcw />
                      Start Over
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl ?? ""}
                    alt="Preview"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  {dimensions && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {dimensions.width}×{dimensions.height}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
