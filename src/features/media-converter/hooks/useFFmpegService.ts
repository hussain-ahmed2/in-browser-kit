import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";
import { MediaConversionFormValues, MediaConversionResult } from "../types";
import { getFFmpegArgs, getMimeType } from "../lib/ffmpegUtils";
import { getOptimalThreadCount } from "../lib/threadUtils";

export function useFFmpegService() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const isConvertingRef = useRef(false);
  const [isFfmpegLoaded, setIsFfmpegLoaded] = useState(false);
  const [logs, setLogs] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

  const load = useCallback(async () => {
    try {
      if (!ffmpegRef.current) {
        ffmpegRef.current = new FFmpeg();
      }
      const baseURL = "/ffmpeg";
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
        if (isConvertingRef.current) setLogs(message);
      });

      ffmpeg.on("progress", ({ progress }) => {
        if (isConvertingRef.current) {
          setProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
        }
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript",
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm",
        ),
        workerURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.worker.js`,
          "text/javascript",
        ),
      });
      setIsFfmpegLoaded(true);
    } catch (error) {
      console.error(error);
      toast.error(
        "Failed to load processing engine. Make sure COOP/COEP headers are set.",
      );
    }
  }, []);

  const convert = useCallback(async (
        file: File, 
        values: MediaConversionFormValues
    ): Promise<MediaConversionResult | null> => {
        if (!file) return null;
        
        setProgress(0);
        setLogs("Loading engine...");
        setIsConverting(true);
        isConvertingRef.current = true;

        if (!isFfmpegLoaded) {
            await load();
        }
        
        if (!ffmpegRef.current) return null;
        
        setLogs("Starting conversion...");

        let inputName = "";
        let outputName = "";

        try {
        const ffmpeg = ffmpegRef.current;
        
        // Emscripten/FFmpeg often fails if virtual file paths contain spaces or special characters.
        // We create a safe clone of the File object with a generic name (e.g. input.mp4) to mount safely.
        const ext = file.name.substring(file.name.lastIndexOf("."));
        const safeInputName = `input${ext}`;
        
        inputName = safeInputName;
        outputName = `output.${values.outputFormat}`;

        await ffmpeg.writeFile(safeInputName, await fetchFile(file));

        const maxThreadsStr = getOptimalThreadCount(file.size).toString();

        const args = getFFmpegArgs(
          values.outputFormat,
          values.quality ?? "medium",
          inputName,
          outputName,
          maxThreadsStr,
        );

        const exitCode = await ffmpeg.exec(args);
        if (exitCode !== 0) {
            throw new Error(`FFmpeg exited with code ${exitCode}. Check logs for details.`);
        }

        const data = await ffmpeg.readFile(outputName);

        const mimeType = getMimeType(values.outputFormat);

        const blob = new Blob([data as unknown as BlobPart], {
          type: mimeType,
        });
        const nameWithoutExt =
          file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        const convertedFile = new File(
          [blob],
          `${nameWithoutExt}.${values.outputFormat}`,
          { type: mimeType },
        );

        toast.success("Conversion complete!");
        return {
          originalFile: file,
          convertedFile,
        };
      } catch (error) {
        console.error(error);
        toast.error(
          "Failed to convert media. It might be corrupt or unsupported.",
        );

        // Terminate the corrupted WASM instance so the next conversion starts fresh.
        // A failed encode can leave libx264's internal state broken, causing
        // "function signature mismatch" errors if the same instance is reused.
        if (ffmpegRef.current) {
          try { ffmpegRef.current.terminate(); } catch {}
          ffmpegRef.current = null;
          setIsFfmpegLoaded(false);
        }

        return null;
      } finally {
        isConvertingRef.current = false;
        setIsConverting(false);
        setProgress(0);
        if (ffmpegRef.current) {
          if (inputName) {
            try {
              ffmpegRef.current.deleteFile(inputName).catch(() => {});
            } catch {}
          }
          if (outputName) {
            try {
              ffmpegRef.current.deleteFile(outputName).catch(() => {});
            } catch {}
          }
        }
      }
    },
    [isFfmpegLoaded, load],
  );

  const clear = useCallback(() => {
    setProgress(0);
    setLogs("");
    // We no longer terminate here. We keep the worker warm for the next conversion.
    // It will only terminate when the component unmounts.
  }, []);

  useEffect(() => {
    return () => {
      if (ffmpegRef.current) {
        try {
          ffmpegRef.current.terminate();
        } catch (e) {
          console.error("Error terminating FFmpeg on unmount:", e);
        }
      }
    };
  }, []);

  return {
    isFfmpegLoaded,
    isConverting,
    progress,
    logs,
    load,
    convert,
    clear,
  };
}
