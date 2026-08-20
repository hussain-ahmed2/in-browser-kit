import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import { toast } from "sonner";
import { MediaConversionFormValues, MediaConversionResult } from "../types";
import { getFFmpegArgs, getMimeType } from "../lib/ffmpegUtils";

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
      const baseURL = "/ffmpeg";
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on("log", ({ message }) => {
        console.log("[FFmpeg]", message);
        setLogs(message);
      });

      ffmpeg.on("progress", ({ progress }) => {
        setProgress(Math.max(0, Math.min(100, Math.round(progress * 100))));
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
        
        setIsConverting(true);
        setProgress(0);
        setLogs("Loading engine...");

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
        const safeFile = new File([file], safeInputName, { type: file.type });
        
        inputName = `/mnt/${safeInputName}`;
        outputName = `output.${values.outputFormat}`;

        // Ensure the mount directory exists before mounting to avoid FS errors
        try {
            await ffmpeg.createDir("/mnt");
        } catch (e) {
            // Directory might already exist, safe to ignore
        }

        // FFFSType is not exported at runtime in the ESM build, so we must cast the string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ffmpeg.mount("WORKERFS" as any, { files: [safeFile] }, "/mnt");

        let maxThreadsStr = "2";
        if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
            // Allocate 75% of available cores, min 2, max 8 (WASM multi-threading plateaus around 8)
            const optimalThreads = Math.max(2, Math.min(8, Math.floor(navigator.hardwareConcurrency * 0.75)));
            maxThreadsStr = optimalThreads.toString();
        }

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
        return null;
      } finally {
        setIsConverting(false);
        if (ffmpegRef.current) {
          try {
            await ffmpegRef.current.unmount("/mnt").catch(() => {});
          } catch (e) {}

          if (outputName) {
            try {
              ffmpegRef.current.deleteFile(outputName).catch(() => {});
            } catch (e) {}
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
