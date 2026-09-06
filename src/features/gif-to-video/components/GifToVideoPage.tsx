"use client";

import { useEffect, useRef } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import { Play, Download, Trash2 } from "lucide-react";

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
} from "../gifToVideoSlice";
import { buildGifToVideoArgs, getMimeType } from "../lib/gifToVideo";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

export function GifToVideoPage() {
  const { isLoaded, isProcessing, progress, status, load, exec } = useFFmpeg();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.gifToVideo);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleConvert = async (format: "mp4" | "webm", fps: number) => {
    if (!state.item?.file) return;
    dispatch(processingSet(true));

    try {
      const inputName = "input.gif";
      const outputName = `output.${format}`;

      const args = buildGifToVideoArgs(inputName, outputName, {
        outputFormat: format,
        fps,
      });

      const data = await exec(args, [
        { name: inputName, data: await fetchFile(state.item.file) },
      ]);

      if (!data) throw new Error("No output data");

      const mime = getMimeType(format);
      const blob = new Blob([data as unknown as BlobPart], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      const nameWithoutExt =
        state.item.file.name.substring(0, state.item.file.name.lastIndexOf(".")) ||
        state.item.file.name;
      const convertedFile = new File([blob], `${nameWithoutExt}.${format}`, {
        type: mime,
      });

      dispatch(
        resultSet({ originalFile: state.item.file, convertedFile, objectUrl }),
      );
      toast.success(`Video created as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert GIF to video.");
      dispatch(processingSet(false));
    }
  };

  const handleClear = () => {
    dispatch(clearAll());
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-5" /> GIF to Video
          </CardTitle>
          <CardDescription>
            Convert animated GIFs to MP4 or WebM video files for smaller sizes
            and better compatibility.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/gif"
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
                <Play className="mx-auto mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload a GIF file
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

              {/* Preview */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={state.item.previewUrl}
                alt="GIF preview"
                className="max-h-48 rounded border border-border"
              />

              {!state.result && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Output Format</Label>
                      <Select defaultValue="mp4">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mp4">MP4</SelectItem>
                          <SelectItem value="webm">WebM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>FPS</Label>
                      <Select defaultValue="15">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30].map((v) => (
                            <SelectItem key={v} value={String(v)}>
                              {v} fps
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleConvert("mp4", 15)}
                    disabled={isProcessing || !isLoaded}
                    className="w-full"
                  >
                    {isProcessing ? "Converting..." : "Convert to Video"}
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
                  <video
                    src={state.result.objectUrl}
                    controls
                    className="w-full max-h-96 rounded border border-border"
                  />
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <a
                        href={state.result.objectUrl}
                        download={state.result.convertedFile.name}
                      >
                        <Download className="mr-2 size-4" /> Download Video
                      </a>
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
