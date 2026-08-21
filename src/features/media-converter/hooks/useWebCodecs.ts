import type { MediaConversionFormValues, MediaConversionResult } from "../types";
import { useCallback, useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { WorkerInputMessage, WorkerOutputMessage } from "../workers/webcodecs.worker";

export function useWebCodecs() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [logs, setLogs] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  
  const workerRef = useRef<Worker | null>(null);

  const load = useCallback(async () => {
    try {
      // Check for WebCodecs support
      if (!("VideoEncoder" in window) || !("VideoDecoder" in window)) {
        setIsSupported(false);
        return;
      }

      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to check WebCodecs support:", error);
      setIsSupported(false);
    }
  }, []);

  // Clean up worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const convert = useCallback(async (
    file: File,
    values: MediaConversionFormValues
  ): Promise<MediaConversionResult | null> => {
    if (!isSupported) {
      toast.error("WebCodecs hardware acceleration only supports MP4 and WebM currently. Falling back to CPU encoder...");
      return null; // Return null to signal fallback to ffmpeg
    }

    setProgress(0);
    setLogs("Spawning Web Worker...");
    setIsConverting(true);

    try {
      // Get precise video duration for accurate FFmpeg-style metrics
      const duration = await new Promise<number>((resolve) => {
        const video = document.createElement("video");
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => resolve(video.duration);
        video.onerror = () => resolve(0);
      });

      return await new Promise<MediaConversionResult>((resolve, reject) => {
        // Instantiate the worker
        const worker = new Worker(new URL("../workers/webcodecs.worker.ts", import.meta.url));
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerOutputMessage>) => {
          const msg = e.data;
          
          if (msg.type === "PROGRESS") {
            setProgress(msg.percent);
            if (msg.logs) {
              setLogs(msg.logs);
            }
          } else if (msg.type === "DONE") {
            const blob = new Blob([msg.buffer], { type: msg.mimeType });
            const convertedFile = new File([blob], `converted-${file.name.split('.')[0]}.${values.outputFormat}`, { type: msg.mimeType });
            
            // Clean up
            worker.terminate();
            workerRef.current = null;
            setIsConverting(false);
            
            resolve({
              originalFile: file,
              convertedFile,
            });
          } else if (msg.type === "ERROR") {
            worker.terminate();
            workerRef.current = null;
            setIsConverting(false);
            reject(new Error(msg.message));
          }
        };

        worker.onerror = (error) => {
          worker.terminate();
          workerRef.current = null;
          setIsConverting(false);
          reject(new Error(error.message || "Unknown worker error"));
        };

        // Send start message
        worker.postMessage({
          type: "START",
          file,
          values,
          duration
        } as WorkerInputMessage);
      });
    } catch (error: unknown) {
      console.error("Hardware conversion error:", error);
      toast.error(error instanceof Error ? error.message : "Hardware conversion failed. Falling back to CPU...");
      setIsConverting(false);
      setProgress(0);
      setLogs("");
      return null; // Fallback
    }
  }, [isSupported]);

  const clear = useCallback(() => {
    setProgress(0);
    setLogs("");
    setIsConverting(false);
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    isLoaded,
    logs,
    progress,
    isConverting,
    isSupported,
    load,
    convert,
    clear,
  };
}
