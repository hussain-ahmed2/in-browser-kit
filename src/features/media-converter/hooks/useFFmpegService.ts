import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
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
      const baseURL = "https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd";
      const ffmpeg = ffmpegRef.current;

      ffmpeg.on("log", ({ message }) => {
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

  const convert = useCallback(
    async (
      file: File,
      values: MediaConversionFormValues,
    ): Promise<MediaConversionResult | null> => {
      if (!file || !isFfmpegLoaded || !ffmpegRef.current) return null;

      setIsConverting(true);
      setProgress(0);
      setLogs("Starting conversion...");

      let inputName = "";
      let outputName = "";

      try {
        const ffmpeg = ffmpegRef.current;
        const inputExt = file.name.split(".").pop() || "tmp";
        inputName = `input.${inputExt}`;
        outputName = `output.${values.outputFormat}`;

        await ffmpeg.writeFile(inputName, await fetchFile(file));

        const maxThreads =
          typeof navigator !== "undefined" && navigator.hardwareConcurrency
            ? Math.min(navigator.hardwareConcurrency, 4).toString()
            : "2";

        const args = getFFmpegArgs(
          values.outputFormat,
          values.quality ?? "medium",
          inputName,
          outputName,
          maxThreads,
        );

        await ffmpeg.exec(args);

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
        if (ffmpegRef.current && inputName && outputName) {
          try {
            ffmpegRef.current.deleteFile(inputName).catch(() => {});
            ffmpegRef.current.deleteFile(outputName).catch(() => {});
          } catch {}
        }
      }
    },
    [isFfmpegLoaded],
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
