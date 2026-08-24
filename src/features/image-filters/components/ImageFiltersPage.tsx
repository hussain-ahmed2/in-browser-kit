"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, RotateCcw, SlidersHorizontal, Download } from "lucide-react";
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
  applyFilters,
  DEFAULT_FILTERS,
  type FilterValues,
} from "../lib/imageFilters";
import { filtersSchema, type FiltersFormValues } from "../types";

const steps = [{ label: "Upload" }, { label: "Adjust" }, { label: "Download" }];

export function ImageFiltersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<{
    file: File;
    objectUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const currentStep = result ? 2 : file ? 1 : 0;

  function getFilterCSS(filters: FilterValues): string {
    const parts: string[] = [];
    if (filters.brightness !== 0)
      parts.push(`brightness(${100 + filters.brightness}%)`);
    if (filters.contrast !== 0)
      parts.push(`contrast(${100 + filters.contrast}%)`);
    if (filters.saturation !== 100)
      parts.push(`saturate(${filters.saturation}%)`);
    if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
    if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
    if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
    if (filters.hueRotate !== 0)
      parts.push(`hue-rotate(${filters.hueRotate}deg)`);
    if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`);
    return parts.join(" ") || "none";
  }

  const form = useForm<FiltersFormValues>({
    resolver: zodResolver(filtersSchema),
    defaultValues: DEFAULT_FILTERS,
    mode: "onChange",
  });

  const watchedFilters = useWatch({ control: form.control }) as FilterValues;
  const previewRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (previewRef.current && file) {
      previewRef.current.style.filter = getFilterCSS(watchedFilters);
    }
  }, [watchedFilters, file]);

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      setFile(selected);
      setResult(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.src = url;
    },
    [previewUrl],
  );

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setDimensions(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    form.reset(DEFAULT_FILTERS);
  }, [form, previewUrl]);

  const handleApply = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const res = await applyFilters(file, watchedFilters);
      setResult(res);
      toast.success("Filters applied successfully!");
    } catch {
      toast.error("Error applying filters");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    form.reset(DEFAULT_FILTERS);
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
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal />
            Filters & Effects
          </CardTitle>
          <CardDescription>
            Adjust brightness, contrast, blur, sepia, grayscale, and more with
            live preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              <FormProvider {...form}>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                  <SliderField
                    name="brightness"
                    label="Brightness"
                    min={-100}
                    max={100}
                    step={1}
                  />
                  <SliderField
                    name="contrast"
                    label="Contrast"
                    min={-100}
                    max={100}
                    step={1}
                  />
                  <SliderField
                    name="saturation"
                    label="Saturation"
                    min={0}
                    max={200}
                    step={1}
                  />
                  <SliderField
                    name="blur"
                    label="Blur"
                    min={0}
                    max={20}
                    step={0.5}
                  />
                  <SliderField
                    name="grayscale"
                    label="Grayscale"
                    min={0}
                    max={100}
                    step={1}
                  />
                  <SliderField
                    name="sepia"
                    label="Sepia"
                    min={0}
                    max={100}
                    step={1}
                  />
                  <SliderField
                    name="hueRotate"
                    label="Hue Rotate"
                    min={0}
                    max={360}
                    step={1}
                  />
                  <SliderField
                    name="invert"
                    label="Invert"
                    min={0}
                    max={100}
                    step={1}
                  />

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                    >
                      <RotateCcw />
                      Reset
                    </Button>
                    <Button
                      onClick={handleApply}
                      disabled={isProcessing}
                      className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Applying...
                        </>
                      ) : (
                        <>
                          <SlidersHorizontal aria-hidden="true" />
                          Apply Filters
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </FormProvider>

              {result ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={result.objectUrl}
                      alt="Filtered result"
                      className="w-full rounded-lg border border-border max-h-96 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <Button onClick={handleDownload} className="flex-1">
                      <Download aria-hidden="true" />
                      Download
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
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={previewRef}
                    src={previewUrl ?? ""}
                    alt="Live preview"
                    className="w-full rounded-lg border border-border max-h-96 object-contain transition-filter duration-100"
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
