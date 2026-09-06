"use client";

import { useEffect, useRef, useState } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import { Maximize, Download, Trash2 } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { StepIndicator } from "@/components/StepIndicator";

import {
  fileSelected,
  processingSet,
  resultSet,
  clearAll,
} from "../videoResizerSlice";
import { buildVideoResizerArgs } from "../lib/videoResizer";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

const PRESETS = [
  { label: "1920×1080 (Full HD)", width: 1920, height: 1080 },
  { label: "1280×720 (HD)", width: 1280, height: 720 },
  { label: "854×480 (SD)", width: 854, height: 480 },
  { label: "640×360", width: 640, height: 360 },
  { label: "Custom", width: 0, height: 0 },
];

export function VideoResizerPage() {
  const { isLoaded, isProcessing, progress, status, load, exec } = useFFmpeg();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.videoResizer);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [width, setWidth] = useState(1280);
  const [height, setHeight] = useState(720);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [preset, setPreset] = useState("1280×720 (HD)");

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

  const handlePresetChange = (label: string) => {
    setPreset(label);
    const p = PRESETS.find((pr) => pr.label === label);
    if (p && p.width > 0) {
      setWidth(p.width);
      setHeight(p.height);
    }
  };

  const handleConvert = async () => {
    if (!state.item?.file) return;
    dispatch(processingSet(true));

    try {
      const ext = state.item.file.name.substring(state.item.file.name.lastIndexOf("."));
      const inputName = `input${ext}`;
      const outputName = `output${ext}`;

      const args = buildVideoResizerArgs(inputName, outputName, {
        width,
        height,
        maintainAspectRatio: maintainAspect,
      });

      const data = await exec(args, [
        { name: inputName, data: await fetchFile(state.item.file) },
      ]);

      if (!data) throw new Error("No output data");

      const blob = new Blob([data as unknown as BlobPart], { type: state.item.file.type || "video/mp4" });
      const objectUrl = URL.createObjectURL(blob);
      const nameWithoutExt =
        state.item.file.name.substring(0, state.item.file.name.lastIndexOf(".")) ||
        state.item.file.name;
      const extStr = ext || ".mp4";
      const convertedFile = new File([blob], `${nameWithoutExt}_resized${extStr}`, {
        type: state.item.file.type || "video/mp4",
      });

      dispatch(
        resultSet({ originalFile: state.item.file, convertedFile, objectUrl }),
      );
      toast.success("Video resized!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to resize video.");
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
            <Maximize className="size-5" /> Video Resizer
          </CardTitle>
          <CardDescription>
            Resize video dimensions to any width and height with optional aspect
            ratio lock.
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
                <Maximize className="mx-auto mb-2 size-8 text-muted-foreground" />
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

              {state.item.file.type.startsWith("video/") && !state.result && (
                <video
                  src={state.item.previewUrl}
                  controls
                  className="w-full max-h-64 rounded border border-border"
                />
              )}

              {!state.result && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Preset</Label>
                    <div className="flex flex-wrap gap-2">
                      {PRESETS.map((p) => (
                        <Button
                          key={p.label}
                          variant={preset === p.label ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePresetChange(p.label)}
                        >
                          {p.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={7680}
                        value={width}
                        onChange={(e) => setWidth(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={4320}
                        value={height}
                        onChange={(e) => setHeight(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Switch
                      id="maintain-aspect"
                      checked={maintainAspect}
                      onCheckedChange={setMaintainAspect}
                    />
                    <Label htmlFor="maintain-aspect">
                      Maintain aspect ratio
                    </Label>
                  </div>

                  <Button
                    onClick={handleConvert}
                    disabled={isProcessing || !isLoaded}
                    className="w-full"
                  >
                    {isProcessing ? "Resizing..." : "Resize Video"}
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
                        <Download className="mr-2 size-4" /> Download Resized
                        Video
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
