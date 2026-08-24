"use client";

import { useCallback, useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Download, RotateCcw, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectField } from "@/components/form/select-field";
import { SliderField } from "@/components/form/slider-field";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import {
  convertFormat,
  SUPPORTED_FORMATS,
  formatBytes,
  detectBrowserAVIFSupport,
  getImageDimensions,
} from "../lib/imageFormatConverter";
import {
  formatConverterSchema,
  type FormatConverterFormValues,
} from "../types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fileSelected,
  processingSet,
  resultSet,
  avifSupportedSet,
  clearAll,
} from "../formatConverterSlice";

const steps = [
  { label: "Upload" },
  { label: "Convert" },
  { label: "Download" },
];

export function ImageFormatConverterPage() {
  const dispatch = useAppDispatch();
  const { item, dimensions, result, isProcessing, avifSupported } =
    useAppSelector((state) => state.imageFormatConverter);

  const currentStep = result ? 2 : item ? 1 : 0;

  const form = useForm<FormatConverterFormValues>({
    resolver: zodResolver(formatConverterSchema),
    defaultValues: { format: "image/jpeg", quality: 0.9 },
    mode: "onChange",
  });

  const watchedFormat = useWatch({ control: form.control, name: "format" });
  const watchedQuality = useWatch({ control: form.control, name: "quality" });

  useEffect(() => {
    dispatch(avifSupportedSet(detectBrowserAVIFSupport()));
  }, [dispatch]);

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

  const handleConvert = async () => {
    if (!item) return;
    dispatch(processingSet(true));
    try {
      const res = await convertFormat(
        item.file,
        watchedFormat,
        watchedQuality ?? 0.9,
      );
      dispatch(resultSet(res));
      toast.success("Format converted successfully!");
    } catch {
      toast.error("Error converting format");
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

  const isQualityVisible =
    watchedFormat !== "image/png" && watchedFormat !== "image/bmp";

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon />
            Format Converter
          </CardTitle>
          <CardDescription>
            Convert images between JPG, PNG, WebP, AVIF, and BMP with quality
            control.
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
                  <SelectField
                    name="format"
                    label="Output Format"
                    options={SUPPORTED_FORMATS.map((f) => ({
                      label: f.label,
                      value: f.value,
                    }))}
                  />
                  {watchedFormat === "image/avif" && !avifSupported && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">
                      ⚠ AVIF encoding may not be supported in this browser.
                      Falls back to PNG if unsupported.
                    </p>
                  )}
                  {isQualityVisible && (
                    <SliderField
                      name="quality"
                      label="Quality"
                      min={0.1}
                      max={1}
                      step={0.05}
                    />
                  )}
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      onClick={handleConvert}
                      disabled={isProcessing}
                      className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2
                            className="animate-spin"
                            aria-hidden="true"
                          />
                          Converting...
                        </>
                      ) : (
                        <>
                          <ImageIcon aria-hidden="true" />
                          Convert
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
                      alt="Converted result"
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
                        Converted Size
                      </p>
                      <p className="font-medium">
                        {formatBytes(result.convertedSize)}
                      </p>
                    </div>
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
                    src={item.previewUrl ?? ""}
                    alt="Preview"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                  {dimensions && (
                    <p className="text-sm text-muted-foreground text-center mt-2">
                      {dimensions.width}×{dimensions.height} •{" "}
                      {formatBytes(item.file.size)}
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
