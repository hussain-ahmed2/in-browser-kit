import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import { MediaConversionFormValues, MediaConversionResult } from "../types";

export function useFFmpegService() {
    const ffmpegRef = useRef<FFmpeg | null>(null);
    const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
    const [logs, setLogs] = useState<string>("");
    const [progress, setProgress] = useState(0);
    const [isConverting, setIsConverting] = useState(false);

    const load = useCallback(async () => {
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
    }, []);

    const convert = useCallback(async (
        file: File, 
        values: MediaConversionFormValues
    ): Promise<MediaConversionResult | null> => {
        if (!file || !isFfmpegLoaded || !ffmpegRef.current) return null;
        
        setIsConverting(true);
        setProgress(0);
        setLogs("Starting conversion...");

        try {
            const ffmpeg = ffmpegRef.current;
            const inputExt = file.name.split('.').pop() || 'tmp';
            const inputName = `input.${inputExt}`;
            const outputName = `output.${values.outputFormat}`;

            await ffmpeg.writeFile(inputName, await fetchFile(file));

            const maxThreads = typeof navigator !== 'undefined' && navigator.hardwareConcurrency 
                ? Math.min(navigator.hardwareConcurrency, 4).toString() 
                : "2";
            
            const args = ["-i", inputName, "-threads", maxThreads];
            
            if (values.outputFormat === "mp4" || values.outputFormat === "webm") {
                if (values.quality === "high") {
                    args.push("-preset", "medium", "-crf", "22");
                } else if (values.quality === "medium") {
                    args.push("-preset", "fast", "-crf", "28");
                } else if (values.quality === "low") {
                    args.push("-preset", "veryfast", "-crf", "35");
                }
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

            toast.success("Conversion complete!");
            return {
                originalFile: file,
                convertedFile
            };
        } catch (error) {
            console.error(error);
            toast.error("Failed to convert media. It might be corrupt or unsupported.");
            return null;
        } finally {
            setIsConverting(false);
        }
    }, [isFfmpegLoaded]);

    const clear = useCallback(() => {
        setProgress(0);
        setLogs("");
    }, []);

    return {
        isFfmpegLoaded,
        isConverting,
        progress,
        logs,
        load,
        convert,
        clear
    };
}
