export function buildVideoToImagesArgs(
  inputName: string,
  outputPattern: string,
  opts: {
    fps: number;
    format: "png" | "jpg";
  },
): string[] {
  return ["-i", inputName, "-vf", `fps=${opts.fps}`, outputPattern];
}

export function getOutputPattern(format: "png" | "jpg"): string {
  return `output_%04d.${format}`;
}

export function getMimeType(format: "png" | "jpg"): string {
  return format === "png" ? "image/png" : "image/jpeg";
}
