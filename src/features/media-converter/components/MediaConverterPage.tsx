"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useFFmpegService } from "../hooks/useFFmpegService";
import { useWebCodecs } from "../hooks/useWebCodecs";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectField } from "@/components/form/select-field";
import { InputField } from "@/components/form/input-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { StepIndicator } from "@/components/StepIndicator";

import { MediaUploader } from "./MediaUploader";
import { MediaResult } from "./MediaResult";
import {
  mediaConversionSchema,
  type MediaConversionFormValues,
  type MediaConversionResult,
} from "../types";

const steps = [
  { label: "Upload" },
  { label: "Configure" },
  { label: "Download" },
];

export function MediaConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MediaConversionResult | null>(null);

  const ffmpeg = useFFmpegService();
  const webCodecs = useWebCodecs();

  const isConverting = ffmpeg.isConverting || webCodecs.isConverting;
  const progress = webCodecs.isConverting ? webCodecs.progress : ffmpeg.progress;
  const logs = webCodecs.isConverting ? webCodecs.logs : ffmpeg.logs;
  const isFfmpegLoaded = ffmpeg.isFfmpegLoaded;

  const currentStep = result ? 2 : file ? 1 : 0;

  const form = useForm<MediaConversionFormValues>({
    resolver: zodResolver(mediaConversionSchema),
    defaultValues: {
      outputFormat: "mp4",
      quality: "medium",
      useHardwareAcceleration: true,
    },
  });

  const handleClear = () => {
    setFile(null);
    setResult(null);
    ffmpeg.clear();
    webCodecs.clear();
  };

  const handleConvert = async (values: MediaConversionFormValues) => {
    if (!file) return;
    
    let conversionResult = null;

    if (values.useHardwareAcceleration && webCodecs.isSupported) {
      conversionResult = await webCodecs.convert(file, values);
    }

    // Fallback to FFmpeg if WebCodecs failed, isn't supported, or user disabled it
    if (!conversionResult) {
      conversionResult = await ffmpeg.convert(file, values);
    }

    if (conversionResult) {
      setResult(conversionResult);
    }
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Convert Media</CardTitle>
          <CardDescription>
            Convert video and audio entirely in your browser without uploading
            to a server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <Alert variant="warning">
            <AlertTriangle className="size-4" />
            <AlertTitle>Performance Notice</AlertTitle>
            <AlertDescription>
              Conversions run locally in your browser. Please keep this tab open
              and visible until the conversion completes to prevent your browser
              from pausing the background process. Very large files may crash
              the browser on older devices.
            </AlertDescription>
          </Alert>

          {!file ? (
            <MediaUploader onFileSelect={setFile} />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border flex items-center justify-between">
                <div className="truncate min-w-0 pr-4">
                  <p className="font-medium text-sm truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isConverting && !result && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {result ? (
                <MediaResult result={result} onStartOver={handleClear} />
              ) : (
                <FormProvider {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleConvert)}
                    className="space-y-6"
                  >
                    <div className="p-8 rounded-xl bg-secondary/30 border border-border">
                      <FieldGroup>
                        <FieldSet className="grid grid-cols-1 sm:grid-cols-2">
                          <SelectField
                            name="outputFormat"
                            label="Output Format"
                            options={[
                              { label: "MP4 Video", value: "mp4" },
                              { label: "WebM Video", value: "webm" },
                              { label: "GIF Animation", value: "gif" },
                              { label: "MP3 Audio", value: "mp3" },
                              { label: "WAV Audio", value: "wav" },
                            ]}
                          />
                          <SelectField
                            name="quality"
                            label="Quality"
                            options={[
                              { label: "High (Larger size)", value: "high" },
                              { label: "Medium (Balanced)", value: "medium" },
                              { label: "Low (Smaller size)", value: "low" },
                            ]}
                          />
                        </FieldSet>
                        <FieldSet className="grid grid-cols-1 sm:grid-cols-2 mt-4">
                          <InputField
                            name="trimStart"
                            label="Trim Start (e.g. 00:00:05)"
                            placeholder="Optional"
                          />
                          <InputField
                            name="trimEnd"
                            label="Trim End (e.g. 00:00:15)"
                            placeholder="Optional"
                          />
                        </FieldSet>
                        {webCodecs.isSupported && (
                          <div className="mt-6 pt-6 border-t border-border">
                            <CheckboxField
                              name="useHardwareAcceleration"
                              label="Hardware Acceleration (WebCodecs)"
                              description="Uses your device's native GPU encoder for massive speedups (5x-10x) and lower battery usage. If it fails, it safely falls back to CPU."
                            />
                          </div>
                        )}
                      </FieldGroup>
                    </div>

                    <div className="flex flex-col gap-4">
                      {isConverting && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Processing...</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full bg-brand transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-muted-foreground text-center truncate opacity-70">
                            {logs}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-end gap-4 pt-4 border-t border-border">
                        <Button
                          type="submit"
                          disabled={isConverting}
                          className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                        >
                          {isConverting ? (
                            <>
                              <Loader2
                                className="animate-spin"
                                aria-hidden="true"
                              />{" "}
                              {webCodecs.isConverting 
                                ? "Hardware Encoding..." 
                                : !isFfmpegLoaded 
                                  ? "Loading Engine..." 
                                  : "Converting..."}
                            </>
                          ) : (
                            "Convert File"
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </FormProvider>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
