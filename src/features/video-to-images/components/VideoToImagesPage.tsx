"use client";

import { useEffect, useRef, useState } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import JSZip from "jszip";
import { Images, Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepIndicator } from "@/components/StepIndicator";

import {
  fileSelected,
  processingSet,
  resultSet,
  clearAll,
} from "../videoToImagesSlice";
import { buildVideoToImagesArgs, getOutputPattern, getMimeType } from "../lib/videoToImages";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

export function VideoToImagesPage() {
  const { isLoaded, isProcessing, progress, status, load, writeFile, readFile, run, deleteFile } = useFFmpeg();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.videoToImages);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fps, setFps] = useState(1);
  const [format, setFormat] = useState<"png" | "jpg">("png");

  useEffect(() => {
    load();
  }, [load]);

  const currentStep = state.result ? 2 : state.item ? 1 : 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    dispatch(fileSelected({ file, previewUrl }));
  };

  const handleConvert = async () => {
    if (!state.item?.file) return;
    dispatch(processingSet(true));

    try {
      const ext = state.item.file.name.substring(state.item.file.name.lastIndexOf("."));
      const inputName = `input${ext}`;
      const outputPattern = getOutputPattern(format);

      const args = buildVideoToImagesArgs(inputName, outputPattern, { fps, format });

      // Write input file
      await writeFile(inputName, (await fetchFile(state.item.file)) as Uint8Array);

      // Run FFmpeg
      await run(args);

      // Read all output frames (enumerate output_0001.png, output_0002.png, ...)
      const frames: { name: string; blob: Blob; objectUrl: string }[] = [];
      const mime = getMimeType(format);
      let idx = 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const padIdx = String(idx).padStart(4, "0");
        const outName = `output_${padIdx}.${format}`;
        try {
          const data = await readFile(outName);
          const blob = new Blob([data as unknown as BlobPart], { type: mime });
          const objectUrl = URL.createObjectURL(blob);
          frames.push({ name: outName, blob, objectUrl });
          await deleteFile(outName);
          idx++;
        } catch {
          // No more files
          break;
        }
      }

      // Cleanup input
      await deleteFile(inputName);

      if (frames.length === 0) {
        throw new Error("No frames extracted");
      }

      dispatch(
        resultSet({
          originalFile: state.item.file,
          frames,
        }),
      );
      toast.success(`${frames.length} frames extracted!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to extract frames.");
      dispatch(processingSet(false));
    }
  };

  const handleClear = () => {
    dispatch(clearAll());
  };

  const handleDownloadAll = async () => {
    if (!state.result) return;
    const zip = new JSZip();
    for (const frame of state.result.frames) {
      zip.file(frame.name, frame.blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.item?.file.name.replace(/\.[^/.]+$/, "") || "frames"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="size-5" /> Video to Images
          </CardTitle>
          <CardDescription>
            Extract frames from a video as PNG or JPG images at any frame rate.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {!state.item ? (
            <Button
              variant="outline"
              size="lg"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-dashed"
            >
              <div className="text-center">
                <Images className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a video file
                </p>
              </div>
            </Button>
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border flex items-center justify-between">
                <div className="truncate min-w-0 pr-4">
                  <p className="font-medium text-sm truncate">
                    {state.item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(state.item.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!isProcessing && !state.result && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>

              {!state.result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frame Rate (FPS)</Label>
                      <Select value={String(fps)} onValueChange={(v) => setFps(Number(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0.5, 1, 2, 5, 10, 15, 25, 30].map((v) => (
                            <SelectItem key={v} value={String(v)}>
                              {v} fps
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select value={format} onValueChange={(v) => setFormat(v as "png" | "jpg")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="png">PNG</SelectItem>
                          <SelectItem value="jpg">JPG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button onClick={handleConvert} disabled={isProcessing || !isLoaded} className="w-full">
                    {isProcessing ? "Extracting..." : "Extract Frames"}
                  </Button>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-xs text-muted-foreground text-center">
                    {status || "Processing..."} — {progress}%
                  </p>
                </div>
              )}

              {state.result && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {state.result.frames.length} frames extracted
                  </p>
                  <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                    {state.result.frames.map((frame) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={frame.name}
                        src={frame.objectUrl}
                        alt={frame.name}
                        className="rounded border border-border"
                      />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleDownloadAll} className="flex-1">
                      <Download className="mr-2 size-4" /> Download ZIP
                    </Button>
                    <Button variant="outline" onClick={handleClear}>
                      Start Over
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
