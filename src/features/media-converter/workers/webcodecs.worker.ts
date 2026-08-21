import type { MediaConversionFormValues } from "../types";

// Messages received by the worker
export type WorkerInputMessage = {
  type: "START";
  file: File;
  values: MediaConversionFormValues;
  duration: number;
  fileHandle?: FileSystemFileHandle;
};

// Messages emitted by the worker
export type WorkerOutputMessage =
  | { type: "PROGRESS"; percent: number; logs: string }
  | { type: "DONE"; buffer: ArrayBuffer; mimeType: string }
  | { type: "ERROR"; message: string };

function formatTime(microseconds: number): string {
  const totalSeconds = microseconds / 1_000_000;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const ms = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms
    .toString()
    .padStart(2, "0")}`;
}

function parseTimeString(timeStr?: string): number | undefined {
  if (!timeStr) return undefined;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return Number(timeStr) || undefined;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0B";
  const k = 1024;
  const sizes = ["B", "kB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
}

const getMimeType = (format: string) => {
  switch (format) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return "video/mp4";
  }
};

self.onmessage = async (e: MessageEvent<WorkerInputMessage>) => {
  const { type } = e.data;
  if (type !== "START") return;

  const { file, values, duration, fileHandle } = e.data;

  try {
    const mediabunny = await import("mediabunny");
    const {
      Input,
      Output,
      Conversion,
      BlobSource,
      Mp4OutputFormat,
      WebMOutputFormat,
      BufferTarget,
      Quality,
      ALL_FORMATS,
      registerVideoSampleTransformer,
      VideoSample,
      StreamTarget,
    } = mediabunny;

    if (values.filter && values.filter !== "none") {
      registerVideoSampleTransformer((sample, description) => {
        const canvas = new OffscreenCanvas(description.width, description.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;
        
        switch (values.filter) {
          case "grayscale": ctx.filter = "grayscale(100%)"; break;
          case "sepia": ctx.filter = "sepia(100%)"; break;
          case "invert": ctx.filter = "invert(100%)"; break;
          case "blur": ctx.filter = "blur(4px)"; break;
          default: break;
        }

        sample.draw(ctx, 0, 0, description.width, description.height);
        return new VideoSample(canvas, { timestamp: sample.timestamp });
      });
    }

    self.postMessage({
      type: "PROGRESS",
      percent: 0,
      logs: "Initializing hardware engine inside Worker...",
    } as WorkerOutputMessage);

    const input = new Input({
      source: new BlobSource(file),
      formats: ALL_FORMATS,
    });

    // Phase 5: Dynamic Bitrate scaling based on original file size
    // Calculate the approximate original bitrate in bits per second
    const originalBitrate = duration > 0 ? (file.size * 8) / duration : 5_000_000;
    let targetBitrate = originalBitrate;

    switch (values.quality) {
      case "low":
        targetBitrate = originalBitrate * 0.3; // Strictly force a 70% reduction in size
        break;
      case "medium":
        targetBitrate = originalBitrate * 0.7; // Strictly force a 30% reduction in size
        break;
      case "high":
        targetBitrate = originalBitrate * 1.2; // Increase by 20% to preserve quality during re-encoding
        break;
      default:
        targetBitrate = originalBitrate;
        break;
    }

    let target;
    let fileSystemWritable: FileSystemWritableFileStream | undefined = undefined;

    if (fileHandle) {
      fileSystemWritable = await fileHandle.createWritable();
      target = new StreamTarget(fileSystemWritable);
    } else {
      target = new BufferTarget();
    }

    const output = new Output({
      format:
        values.outputFormat === "mp4"
          ? new Mp4OutputFormat({ fastStart: false })
          : new WebMOutputFormat(),
      target,
    });

    const start = parseTimeString(values.trimStart);
    const end = parseTimeString(values.trimEnd);

    const conversion = await Conversion.init({
      input,
      output,
      video: {
        quality: new Quality({
          bitrate: Math.floor(targetBitrate),
          bitrateMode: "variable",
        }),
        hardwareAcceleration: "prefer-hardware",
      },
      audio: {
        quality: new Quality(values.quality || "medium"),
      },
      ...(start !== undefined || end !== undefined
        ? { trim: { start, end } }
        : {}),
    });

    const startTime = Date.now();
    let maxWritten = 0;

    target.on("write", ({ end }) => {
      if (end > maxWritten) {
        maxWritten = end;
      }
    });

    conversion.onProgress = (progressRatio) => {
      const percent = Math.round(progressRatio * 100);
      const elapsedRealSeconds = (Date.now() - startTime) / 1000;
      const mediaTimeSeconds = duration * progressRatio;

      const frames = Math.floor(mediaTimeSeconds * 30);
      const fps =
        elapsedRealSeconds > 0 ? Math.round(frames / elapsedRealSeconds) : 0;
      const speed =
        elapsedRealSeconds > 0
          ? (mediaTimeSeconds / elapsedRealSeconds).toFixed(2)
          : "0.00";
      const formattedTime = formatTime(mediaTimeSeconds * 1_000_000);
      const formattedSize = formatBytes(maxWritten);

      const logs = `frame=${frames
        .toString()
        .padStart(4, " ")} fps=${fps
        .toString()
        .padStart(3, " ")} q=GPU size=${formattedSize.padStart(
        8,
        " "
      )} time=${formattedTime} bitrate=VBR speed=${speed}x`;

      self.postMessage({
        type: "PROGRESS",
        percent,
        logs,
      } as WorkerOutputMessage);
    };

    await conversion.execute();

    const mimeType = getMimeType(values.outputFormat);
    
    if (fileHandle) {
      self.postMessage({
        type: "DONE",
        buffer: new ArrayBuffer(0),
        mimeType,
      } as WorkerOutputMessage);
    } else {
      const arrayBuffer = (target as { buffer?: ArrayBuffer }).buffer;
      if (!arrayBuffer) {
        throw new Error("Target buffer is empty after conversion.");
      }
      self.postMessage(
        {
          type: "DONE",
          buffer: arrayBuffer,
          mimeType,
        } as WorkerOutputMessage,
        { transfer: [arrayBuffer] }
      );
    }
  } catch (error: unknown) {
    console.error("Worker error:", error);
    self.postMessage({
      type: "ERROR",
      message: error instanceof Error ? error.message : String(error),
    } as WorkerOutputMessage);
  }
};
