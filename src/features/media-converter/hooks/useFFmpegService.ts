import { useState, useRef, useCallback, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL, fetchFile } from "@ffmpeg/util";
import { toast } from "sonner";
import { MediaConversionFormValues, MediaConversionResult } from "../types";
import { getFFmpegArgs, getMimeType } from "../lib/ffmpegUtils";
import { getOptimalThreadCount } from "../lib/threadUtils";

export function useFFmpegService() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const execStartTimeRef = useRef(0);
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

      // When reusing the same FFmpeg instance for a second conversion, the worker
      // replays stale progress events from the previous encode. These arrive via
      // postMessage within the first ~200ms of exec(). We use a timestamp guard
      // to ignore any events that arrive too quickly after exec() starts.
      ffmpeg.on("progress", ({ progress: p }) => {
        const elapsed = Date.now() - execStartTimeRef.current;
        if (execStartTimeRef.current > 0 && elapsed > 500) {
          const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
          setProgress(pct);
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
          values.resolution ?? "original",
          values.videoCodec ?? "default",
          inputName,
          outputName,
          maxThreadsStr,
          values.trimStart,
          values.trimEnd
        );

        // Record the timestamp right before exec(). The progress listener will
        // ignore any events that arrive within 500ms of this time — that window
        // is when the FFmpeg worker replays stale progress events from the
        // previous conversion. Real encoding progress only starts after FFmpeg
        // finishes initializing the codec, which takes >500ms.
        setProgress(0);
        execStartTimeRef.current = Date.now();

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
        execStartTimeRef.current = 0;
        setIsConverting(false);
        setProgress(0);
        setLogs("");
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
