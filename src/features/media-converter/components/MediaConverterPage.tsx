"use client";

import { useState, useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { StepIndicator } from "@/components/StepIndicator";

import { MediaUploader } from "./MediaUploader";
import { MediaResult } from "./MediaResult";
import { VideoPreview } from "./VideoPreview";
import { MediaConverterForm } from "./MediaConverterForm";
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

  const isVideo = file?.type.startsWith("video/") ?? false;
  const currentStep = result ? 2 : file ? 1 : 0;

  const form = useForm<MediaConversionFormValues>({
    resolver: zodResolver(mediaConversionSchema),
    defaultValues: {
      outputFormat: "mp4",
      quality: "medium",
      filter: "none",
      saveMode: "direct",
      resolution: 'original',
      videoCodec: 'default',
      useHardwareAcceleration: true,
    },
  });

  useEffect(() => {
    if (file) {
      if (isVideo) {
        form.setValue("outputFormat", "mp4");
      } else {
        form.setValue("outputFormat", "mp3");
      }
    }
  }, [file, isVideo, form]);

  const selectedFilter = useWatch({ control: form.control, name: "filter"});
  const handleClear = () => {
    setFile(null);
    setResult(null);
    ffmpeg.clear();
    webCodecs.clear();
  };

  const handleConvert = async (values: MediaConversionFormValues) => {
    if (!file) return;
    
    let conversionResult = null;
    let fileHandle: FileSystemFileHandle | undefined = undefined;

    if (values.useHardwareAcceleration && webCodecs.isSupported) {
      // Direct-to-Disk Streaming (Phase 4)
      if (values.saveMode === "direct" && "showSaveFilePicker" in window) {
        try {
          // @ts-expect-error showSaveFilePicker is not in standard DOM types yet
          fileHandle = await window.showSaveFilePicker({
            suggestedName: `converted-${file.name.replace(/\.[^/.]+$/, "")}.${values.outputFormat}`,
            types: [
              {
                description: "Converted Media File",
                accept: {
                  [`video/${values.outputFormat}`]: [`.${values.outputFormat}`],
                },
              },
            ],
          });
        } catch (err: unknown) {
          // User cancelled the picker, abort conversion
          if (err instanceof Error && err.name === "AbortError") return;
          console.error("Failed to get file handle", err);
        }
      }

      conversionResult = await webCodecs.convert(file, values, fileHandle);
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
            <div className={`animate-fade-in items-start gap-8 ${file.type.startsWith("video/") && !result ? "grid lg:grid-cols-[1fr_1fr]" : "space-y-6"}`}>
              <div className="space-y-6 flex-1 min-w-0">
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

                {file.type.startsWith("video/") && !result && (
                  <VideoPreview file={file} filter={selectedFilter || "none"} />
                )}

                {result && (
                  <MediaResult result={result} onStartOver={handleClear} />
                )}
              </div>

              {!result && (
                <div className="flex-1 min-w-0">
                  <FormProvider {...form}>
                    <MediaConverterForm
                      isVideo={isVideo}
                      webCodecsSupported={webCodecs.isSupported}
                      isConverting={isConverting}
                      isHardwareEncoding={webCodecs.isConverting}
                      isFfmpegLoaded={isFfmpegLoaded}
                      progress={progress}
                      logs={logs}
                      onConvert={handleConvert}
                    />
                  </FormProvider>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
