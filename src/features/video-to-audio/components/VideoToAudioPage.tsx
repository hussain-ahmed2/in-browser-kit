"use client";

import { useEffect, useRef } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "sonner";
import { fetchFile } from "@ffmpeg/util";
import { Music, Download, Trash2 } from "lucide-react";

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
} from "../videoToAudioSlice";
import {
  buildVideoToAudioArgs,
  getMimeType,
  getFileExtension,
} from "../lib/videoToAudio";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

const FORMAT_OPTIONS = [
  { label: "MP3", value: "mp3" },
  { label: "WAV", value: "wav" },
  { label: "AAC", value: "aac" },
  { label: "OGG", value: "ogg" },
];

export function VideoToAudioPage() {
  const { isLoaded, isProcessing, progress, status, load, exec } = useFFmpeg();
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.videoToAudio);
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

  const handleConvert = async (format: "mp3" | "wav" | "aac" | "ogg") => {
    if (!state.item?.file) return;
    dispatch(processingSet(true));

    try {
      const ext = state.item.file.name.substring(
        state.item.file.name.lastIndexOf("."),
      );
      const inputName = `input${ext}`;
      const outputName = `output${getFileExtension(format)}`;

      const args = buildVideoToAudioArgs(inputName, outputName, format);

      const data = await exec(args, [
        { name: inputName, data: await fetchFile(state.item.file) },
      ]);

      if (!data) throw new Error("No output data");

      const mime = getMimeType(format);
      const blob = new Blob([data as unknown as BlobPart], { type: mime });
      const objectUrl = URL.createObjectURL(blob);
      const nameWithoutExt =
        state.item.file.name.substring(
          0,
          state.item.file.name.lastIndexOf("."),
        ) || state.item.file.name;
      const convertedFile = new File(
        [blob],
        `${nameWithoutExt}${getFileExtension(format)}`,
        { type: mime },
      );

      dispatch(
        resultSet({ originalFile: state.item.file, convertedFile, objectUrl }),
      );
      toast.success(`Audio extracted as ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to extract audio.");
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
            <Music className="size-5" /> Video to Audio
          </CardTitle>
          <CardDescription>
            Extract audio from video files as MP3, WAV, AAC, or OGG.
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
                <Music className="mx-auto mb-2 size-8 text-muted-foreground" />
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
                    <Label>Audio Format</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {FORMAT_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          variant="outline"
                          onClick={() =>
                            handleConvert(
                              opt.value as "mp3" | "wav" | "aac" | "ogg",
                            )
                          }
                          disabled={isProcessing || !isLoaded}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
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
                  <audio
                    src={state.result.objectUrl}
                    controls
                    className="w-full"
                  />
                  <div className="flex gap-3">
                    <Button asChild className="flex-1">
                      <a
                        href={state.result.objectUrl}
                        download={state.result.convertedFile.name}
                      >
                        <Download className="mr-2 size-4" /> Download Audio
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
