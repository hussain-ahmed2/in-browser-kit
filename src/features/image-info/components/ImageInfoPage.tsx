"use client";

import { useState, useCallback } from "react";
import { Info } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import { extractImageInfo, type ImageInfo } from "../lib/imageInfo";
import { ImagePreview } from "./ImagePreview";
import { FileInfoSection } from "./FileInfoSection";
import { ColorInfoSection } from "./ColorInfoSection";
import { ResolutionSection } from "./ResolutionSection";
import { ICCProfileSection } from "./ICCProfileSection";
import { ExifSection } from "./ExifSection";
import { GPSSection } from "./GPSSection";
import { RawExifSection } from "./RawExifSection";

const steps = [{ label: "Upload" }, { label: "Details" }];

export function ImageInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<ImageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const currentStep = info ? 1 : file ? 1 : 0;

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      setFile(selected);
      setInfo(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);

      setIsLoading(true);
      try {
        const data = await extractImageInfo(selected);
        setInfo(data);
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
          URL.revokeObjectURL(img.src);
        };
        img.src = url;
      } catch (err) {
        console.error(err);
        toast.error("Failed to extract image info");
      } finally {
        setIsLoading(false);
      }
    },
    [previewUrl],
  );

  if (!file) {
    return (
      <>
        <StepIndicator steps={steps} currentStep={currentStep} />
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info />
              Image Info Viewer
            </CardTitle>
            <CardDescription>
              View DPI, color space, file size, dimensions, EXIF, ICC profile,
              and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  if (!info) {
    return (
      <>
        <StepIndicator steps={steps} currentStep={currentStep} />
        <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info />
              Image Info Viewer
            </CardTitle>
            <CardDescription>
              View DPI, color space, file size, dimensions, EXIF, ICC profile,
              and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground">
                    Extracting metadata...
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Failed to load image info
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            Image Info Viewer
          </CardTitle>
          <CardDescription>
            View DPI, color space, file size, dimensions, EXIF, ICC profile, and
            more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
            <ImagePreview
              previewUrl={previewUrl}
              dimensions={dimensions}
              info={info}
              onClear={() => {
                setFile(null);
                setInfo(null);
                setDimensions(null);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
              }}
              onDownloadJson={() => {
                if (!info) return;
                const json = JSON.stringify(info, null, 2);
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${file?.name.replace(/\.[^/.]+$/, "")}-metadata.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              onCopyAll={() => {
                if (!info) return;
                const json = JSON.stringify(info, null, 2);
                navigator.clipboard.writeText(json);
                toast.success("All metadata copied to clipboard!");
              }}
            />

            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <FileInfoSection info={info} />
              <ColorInfoSection info={info} />
              <ResolutionSection info={info} />
              <ICCProfileSection iccProfile={info.iccProfile} />
              <ExifSection exif={info.exif} />
              <GPSSection gps={info.exif?.gps} />
              <RawExifSection rawExif={info.rawExif} />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
