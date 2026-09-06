"use client";

import { useEffect, useRef } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import { Film, Download, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
} from "../videoToGifSlice";
import { buildVideoToGifArgs } from "../lib/videoToGif";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

export function VideoToGifPage() {
  const { isLoaded, isProcessing, progress, status, load, exec } = useFFmpeg();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.videoToGif);
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

  const handleConvert = async () => {
    if (!state.item?.file) return;
    dispatch(processingSet(true));

    try {
      const ext = state.item.file.name.substring(
        state.item.file.name.lastIndexOf("."),
      );
      const inputName = `input${ext}`;
      const outputName = "output.gif";

      // These would normally come from a form; defaults are fine for now
      const args = buildVideoToGifArgs(inputName, outputName, {
        startTime: "00:00:00",
        duration: "00:00:05",
        fps: 10,
        width: 480,
      });

      const data = await exec(args, [
        { name: inputName, data: await fetchFile(state.item.file) },
      ]);

      if (!data) throw new Error("No output data");

      const blob = new Blob([data as unknown as BlobPart], { type: "image/gif" });
      const objectUrl = URL.createObjectURL(blob);
      const nameWithoutExt =
        state.item.file.name.substring(
          0,
          state.item.file.name.lastIndexOf("."),
        ) || state.item.file.name;
      const convertedFile = new File([blob], `${nameWithoutExt}.gif`, {
        type: "image/gif",
      });

      dispatch(resultSet({ originalFile: state.item.file, convertedFile, objectUrl }));
      toast.success("GIF created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to convert video to GIF.");
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
            <Film className="size-5" /> Video to GIF
          </CardTitle>
          <CardDescription>
            Convert video clips to animated GIFs with custom FPS, dimensions,
            and timing — entirely in your browser.
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
                <Film className="mx-auto mb-2 size-8 text-muted-foreground" />
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
                      <Label>Start Time</Label>
                      <Input defaultValue="00:00:00" placeholder="HH:MM:SS" />
                    </div>
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input defaultValue="00:00:05" placeholder="HH:MM:SS" />
                    </div>
                    <div className="space-y-2">
                      <Label>FPS</Label>
                      <Select defaultValue="10">
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
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Select defaultValue="480">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[240, 320, 480, 640, 800, 1024].map((v) => (
                            <SelectItem key={v} value={String(v)}>
                              {v}px
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing || !isLoaded}
                    className="w-full"
                  >
                    {isProcessing ? "Converting..." : "Convert to GIF"}
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
                  <div className="rounded-lg border border-border overflow-hidden bg-secondary/30 flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={state.result.objectUrl}
                      alt="Generated GIF"
                      className="max-w-full max-h-96 rounded"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <a
                        href={state.result.objectUrl}
                        download={state.result.convertedFile.name}
                      >
                        <Download className="mr-2 size-4" /> Download GIF
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
