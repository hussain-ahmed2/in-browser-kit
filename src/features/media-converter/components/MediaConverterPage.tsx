"use client";

import { useState, useRef, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectField } from "@/components/form/select-field";
import { StepIndicator } from "@/components/StepIndicator";

import { MediaUploader } from "./MediaUploader";
import { MediaResult } from "./MediaResult";
import { mediaConversionSchema, type MediaConversionFormValues, type MediaConversionResult } from "../types";

const steps = [{ label: "Upload" }, { label: "Configure" }, { label: "Download" }];

export function MediaConverterPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<MediaConversionResult | null>(null);
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
    
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const [logs, setLogs] = useState<string>("");

    const load = async () => {
        try {
            if (!ffmpegRef.current) {
                ffmpegRef.current = new FFmpeg();
            }
            const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
            const ffmpeg = ffmpegRef.current;
            
            ffmpeg.on("log", ({ message }) => {
                setLogs(message);
            });
            
            ffmpeg.on("progress", ({ progress }) => {
                setProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
            });

            await ffmpeg.load({
                coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
            });
            setIsFfmpegLoaded(true);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load processing engine. Make sure COOP/COEP headers are set.");
        }
    };

    useEffect(() => {
        if (file && !isFfmpegLoaded) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            load();
        }
    }, [file, isFfmpegLoaded]);

    const currentStep = result ? 2 : file ? 1 : 0;

    const form = useForm<MediaConversionFormValues>({
        resolver: zodResolver(mediaConversionSchema),
        defaultValues: {
            outputFormat: "mp4",
            quality: "medium"
        }
    });

    const handleClear = () => {
        setFile(null);
        setResult(null);
        setProgress(0);
        setLogs("");
    };

    const handleConvert = async (values: MediaConversionFormValues) => {
        if (!file || !isFfmpegLoaded || !ffmpegRef.current) return;
        setIsConverting(true);
        setProgress(0);
        setLogs("Starting conversion...");

        try {
            const ffmpeg = ffmpegRef.current;
            const inputExt = file.name.split('.').pop() || 'tmp';
            const inputName = `input.${inputExt}`;
            const outputName = `output.${values.outputFormat}`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const args = ["-i", inputName, "-threads", "0"];
            
            if (values.outputFormat === "mp4" || values.outputFormat === "webm") {
                args.push("-preset", "ultrafast");
                if (values.quality === "high") args.push("-crf", "18");
                if (values.quality === "medium") args.push("-crf", "23");
                if (values.quality === "low") args.push("-crf", "28");
            } else if (values.outputFormat === "mp3") {
                if (values.quality === "high") args.push("-b:a", "320k");
                if (values.quality === "medium") args.push("-b:a", "192k");
                if (values.quality === "low") args.push("-b:a", "128k");
            }

            args.push(outputName);

            await ffmpeg.exec(args);

            const data = await ffmpeg.readFile(outputName);
            
            const mimeType = 
                values.outputFormat === "mp4" ? "video/mp4" :
                values.outputFormat === "webm" ? "video/webm" :
                values.outputFormat === "mp3" ? "audio/mpeg" :
                values.outputFormat === "wav" ? "audio/wav" :
                values.outputFormat === "gif" ? "image/gif" :
                "application/octet-stream";

            const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const convertedFile = new File([blob], `${nameWithoutExt}.${values.outputFormat}`, { type: mimeType });

            setResult({
                originalFile: file,
                convertedFile
            });
            
            toast.success("Conversion complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to convert media. It might be corrupt or unsupported.");
        } finally {
            setIsConverting(false);
        }
    };

    return (
        <>
            <StepIndicator steps={steps} currentStep={currentStep} />
            <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
                <CardHeader>
                    <CardTitle>Convert Media</CardTitle>
                    <CardDescription>Convert video and audio entirely in your browser without uploading to a server.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {!file ? (
                        <MediaUploader onFileSelect={setFile} />
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-lg bg-secondary/50 border border-border flex items-center justify-between">
                                <div className="truncate min-w-0 pr-4">
                                    <p className="font-medium text-sm truncate">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {!isConverting && !result && (
                                    <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
                                        Remove
                                    </Button>
                                )}
                            </div>

                            {result ? (
                                <MediaResult result={result} onStartOver={handleClear} />
                            ) : (
                                <FormProvider {...form}>
                                    {/* eslint-disable-next-line react-hooks/refs */}
                                    <form onSubmit={form.handleSubmit(handleConvert)} className="space-y-6">
                                        <div className="p-6 rounded-xl bg-secondary/30 border border-border space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <SelectField
                                                    name="outputFormat"
                                                    label="Output Format"
                                                    options={[
                                                        { label: "MP4 Video", value: "mp4" },
                                                        { label: "WebM Video", value: "webm" },
                                                        { label: "GIF Animation", value: "gif" },
                                                        { label: "MP3 Audio", value: "mp3" },
                                                        { label: "WAV Audio", value: "wav" }
                                                    ]}
                                                />
                                                <SelectField
                                                    name="quality"
                                                    label="Quality"
                                                    options={[
                                                        { label: "High (Larger size)", value: "high" },
                                                        { label: "Medium (Balanced)", value: "medium" },
                                                        { label: "Low (Smaller size)", value: "low" }
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {isConverting && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs text-muted-foreground">
                                                        <span>Processing...</span>
                                                        <span>{progress}%</span>
                                                    </div>
                                                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                                                        <div className="h-full bg-brand transition-all duration-300" style={{ width: `${progress}%` }} />
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground text-center truncate opacity-70">{logs}</p>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-4 pt-4 border-t border-border">
                                                <Button
                                                    type="submit"
                                                    disabled={isConverting || !isFfmpegLoaded}
                                                    className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                                                >
                                                    {isConverting ? (
                                                        <><Loader2 className="animate-spin size-4 mr-2" aria-hidden="true" /> Converting...</>
                                                    ) : !isFfmpegLoaded ? (
                                                        <><Loader2 className="animate-spin size-4 mr-2" aria-hidden="true" /> Loading Engine...</>
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
