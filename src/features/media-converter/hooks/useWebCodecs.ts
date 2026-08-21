import { useState, useCallback } from "react";
import { toast } from "sonner";
import { MediaConversionFormValues, MediaConversionResult } from "../types";
import { getMimeType } from "../lib/ffmpegUtils";

// We dynamically import mediabunny so it doesn't break SSR
let mediabunny: typeof import("mediabunny") | null = null;

function formatTime(microseconds: number): string {
  const totalSeconds = microseconds / 1_000_000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

function parseTimeString(timeStr?: string): number | undefined {
  if (!timeStr) return undefined;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(timeStr) || undefined;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0B';
  const k = 1024;
  const sizes = ['B', 'kB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

export function useWebCodecs() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [logs, setLogs] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [isSupported, setIsSupported] = useState(true); // Assume true until tested

  const load = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      
      // Check for WebCodecs support
      if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
        setIsSupported(false);
        return;
      }

      if (!mediabunny) {
        mediabunny = await import("mediabunny");
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to load WebCodecs dependencies:", error);
      setIsSupported(false);
    }
  }, []);

  const convert = useCallback(async (
    file: File,
    values: MediaConversionFormValues
  ): Promise<MediaConversionResult | null> => {
    if (!isLoaded) {
      await load();
    }

    if (!file || !mediabunny) return null;
    
    // WebCodecs typically outputs to MP4 or WebM natively.
    // If user wants GIF or MP3, we might need to fallback to FFmpeg for now,
    // or configure mediabunny appropriately (if it supports it).
    if (!["mp4", "webm"].includes(values.outputFormat)) {
      toast.error("WebCodecs hardware acceleration only supports MP4 and WebM currently. Falling back to CPU encoder...");
      return null; // Return null to signal fallback to ffmpeg
    }

    setProgress(0);
    setLogs("Initializing hardware engine...");
    setIsConverting(true);

    try {
      const { Input, Output, Conversion, BlobSource, Mp4OutputFormat, WebMOutputFormat, BufferTarget, Quality, ALL_FORMATS } = mediabunny;

      const input = new Input({
        source: new BlobSource(file),
        formats: ALL_FORMATS,
      });

      const target = new BufferTarget();
      const output = new Output({
        format: values.outputFormat === "mp4" ? new Mp4OutputFormat({ fastStart: false }) : new WebMOutputFormat(),
        target,
      });

      // Basic transcoding setup using mediabunny's automatic conversion pipeline
      const start = parseTimeString(values.trimStart);
      const end = parseTimeString(values.trimEnd);

      const conversion = await Conversion.init({ 
        input, 
        output,
        ...(start !== undefined || end !== undefined ? { trim: { start, end } } : {}),
        video: {
          quality: new Quality(values.quality || "medium"),
          hardwareAcceleration: "prefer-hardware"
        },
        audio: {
          quality: new Quality(values.quality || "medium")
        }
      });

      // We can hook into the conversion loop to track progress if mediabunny exposes it.
      setLogs("Encoding via hardware GPU...");
      
      // Get precise video duration for accurate FFmpeg-style metrics
      const duration = await new Promise<number>((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => resolve(0);
      });

      const startTime = Date.now();
      let maxWritten = 0;

      target.on('write', ({ end }) => {
        if (end > maxWritten) {
          maxWritten = end;
        }
      });
      
      conversion.onProgress = (progressRatio) => {
        const percent = Math.round(progressRatio * 100);
        setProgress(percent);

        const elapsedRealSeconds = (Date.now() - startTime) / 1000;
        const mediaTimeSeconds = duration * progressRatio;
        
        const frames = Math.floor(mediaTimeSeconds * 30); // Approximate 30fps
        const fps = elapsedRealSeconds > 0 ? Math.round(frames / elapsedRealSeconds) : 0;
        const speed = elapsedRealSeconds > 0 ? (mediaTimeSeconds / elapsedRealSeconds).toFixed(2) : "0.00";
        const formattedTime = formatTime(mediaTimeSeconds * 1_000_000);
        const formattedSize = formatBytes(maxWritten);

        // Mimic FFmpeg's technical output for consistency and rich feedback
        setLogs(`frame=${frames.toString().padStart(4, ' ')} fps=${fps.toString().padStart(3, ' ')} q=GPU size=${formattedSize.padStart(8, ' ')} time=${formattedTime} bitrate=VBR speed=${speed}x`);
      };

      await conversion.execute();

      const arrayBuffer = target.buffer;
      if (!arrayBuffer) {
        throw new Error("Target buffer is empty after conversion.");
      }

      const mimeType = getMimeType(values.outputFormat);
      const blob = new Blob([arrayBuffer], { type: mimeType });
      
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const convertedFile = new File(
        [blob],
        `${nameWithoutExt}.${values.outputFormat}`,
        { type: mimeType }
      );

      toast.success("Hardware conversion complete!");
      return {
        originalFile: file,
        convertedFile,
      };
    } catch (error) {
      console.error("WebCodecs conversion error:", error);
      toast.error("Hardware conversion failed. Trying fallback...");
      return null;
    } finally {
      setIsConverting(false);
      setProgress(0);
      setLogs("");
    }
  }, [isLoaded, load]);

  const clear = useCallback(() => {
    setProgress(0);
    setLogs("");
  }, []);

  return {
    isSupported,
    isLoaded,
    isConverting,
    progress,
    logs,
    load,
    convert,
    clear,
  };
}
