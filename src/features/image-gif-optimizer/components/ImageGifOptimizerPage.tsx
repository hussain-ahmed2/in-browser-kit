"use client";

import { useState, useCallback } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Download, RotateCcw, Trash2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SliderField } from "@/components/form/slider-field";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import {
  optimizeGif,
  formatBytes,
  type OptimizeResult,
} from "../lib/imageGifOptimizer";
import { gifOptimizerSchema, type GifOptimizerFormValues } from "../types";
import NextImage from "next/image";

const steps = [
  { label: "Upload" },
  { label: "Optimize" },
  { label: "Download" },
];

export function ImageGifOptimizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const currentStep = result ? 2 : file ? 1 : 0;

  const form = useForm<GifOptimizerFormValues>({
    resolver: zodResolver(gifOptimizerSchema),
    defaultValues: {
      maxColors: 256,
      removeDuplicates: true,
      lossyLevel: 10,
      optimizeFrames: true,
    },
    mode: "onChange",
  });

  const watchedColors = useWatch({ control: form.control, name: "maxColors" });
  const watchedDuplicates = useWatch({
    control: form.control,
    name: "removeDuplicates",
  });
  const watchedLossy = useWatch({ control: form.control, name: "lossyLevel" });
  const optimizeFrames = useWatch({
    control: form.control,
    name: "optimizeFrames",
  });

  const handleFiles = useCallback(
    (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      setFile(selected);
      setResult(null);
      setPreviewUrl(URL.createObjectURL(selected));

      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.src = previewUrl!;
    },
    [previewUrl],
  );

  const handleClear = () => {
    setFile(null);
    setResult(null);
    setDimensions(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleOptimize = async (values: GifOptimizerFormValues) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await optimizeGif(file, {
        maxColors: Number(values.maxColors),
        removeDuplicates: values.removeDuplicates ?? true,
        lossyLevel: Number(values.lossyLevel),
        optimizeFrames: values.optimizeFrames ?? true,
      });
      setResult(res);
      toast.success(`Optimized! Saved ${res.savings}%`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to optimize GIF");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.objectUrl;
    a.download = result.file.name;
    a.click();
  };

  const handleFormSubmit = (values: GifOptimizerFormValues) => {
    handleOptimize(values);
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles />
            GIF Optimizer
          </CardTitle>
          <CardDescription>
            Reduce GIF file size by optimizing colors and frames.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/gif"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              <FormProvider {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                    <SliderField
                      name="maxColors"
                      label="Max Colors"
                      min={2}
                      max={256}
                      step={1}
                    />
                    <SliderField
                      name="lossyLevel"
                      label="Lossy Compression"
                      min={0}
                      max={100}
                      step={1}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="removeDuplicates"
                        checked={watchedDuplicates}
                        onChange={(e) =>
                          form.setValue("removeDuplicates", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="removeDuplicates"
                        className="text-sm font-medium"
                      >
                        Remove duplicate frames
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="optimizeFrames"
                        checked={optimizeFrames}
                        onChange={(e) =>
                          form.setValue("optimizeFrames", e.target.checked)
                        }
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="optimizeFrames"
                        className="text-sm font-medium"
                      >
                        Optimize frame disposal
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Optimizing...
                        </>
                      ) : (
                        <>
                          <Sparkles aria-hidden="true" />
                          Optimize GIF
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    <NextImage
                      src={result.objectUrl}
                      alt="Optimized GIF"
                      width={result.width}
                      height={result.height}
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        Original Size
                      </p>
                      <p className="font-medium">
                        {formatBytes(result.originalSize)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">
                        Optimized Size
                      </p>
                      <p className="font-medium">
                        {formatBytes(result.optimizedSize)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Savings
                      </p>
                      <p className="font-medium text-green-700 dark:text-green-400">
                        {result.savings}%
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-xs text-muted-foreground">Frames</p>
                      <p className="font-medium">
                        {result.originalFrameCount} → {result.frameCount}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download aria-hidden="true" />
                      Download Optimized GIF
                    </Button>
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
                <div className="space-y-6 animate-fade-in">
                  <div className="relative group">
                    <NextImage
                      src={previewUrl!}
                      alt="Preview"
                      width={dimensions?.width || 400}
                      height={dimensions?.height || 300}
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  {dimensions && (
                    <p className="text-sm text-muted-foreground text-center">
                      {dimensions.width}×{dimensions.height}
                    </p>
                  )}

                  <FormProvider {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleFormSubmit)}
                      className="space-y-6"
                    >
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                        <SliderField
                          name="maxColors"
                          label="Max Colors"
                          min={2}
                          max={256}
                          step={1}
                        />
                        <SliderField
                          name="lossyLevel"
                          label="Lossy Compression"
                          min={0}
                          max={100}
                          step={1}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="removeDuplicates"
                            checked={watchedDuplicates}
                            onChange={(e) =>
                              form.setValue(
                                "removeDuplicates",
                                e.target.checked,
                              )
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="removeDuplicates"
                            className="text-sm font-medium"
                          >
                            Remove duplicate frames
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="optimizeFrames"
                            checked={form.watch("optimizeFrames")}
                            onChange={(e) =>
                              form.setValue("optimizeFrames", e.target.checked)
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor="optimizeFrames"
                            className="text-sm font-medium"
                          >
                            Optimize frame disposal
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2
                              className="animate-spin"
                              aria-hidden="true"
                            />
                            Optimizing...
                          </>
                        ) : (
                          <>
                            <Sparkles aria-hidden="true" />
                            Optimize GIF
                          </>
                        )}
                      </Button>
                    </form>
                  </FormProvider>

                  <div className="relative group">
                    <NextImage
                      src={previewUrl!}
                      alt="Preview"
                      width={dimensions?.width || 400}
                      height={dimensions?.height || 300}
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      <Trash2 />
                    </Button>
                  </div>

                  {dimensions && (
                    <p className="text-sm text-muted-foreground text-center">
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
