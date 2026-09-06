export function buildGifToVideoArgs(
  inputName: string,
  outputName: string,
  opts: {
    outputFormat: "mp4" | "webm";
    fps: number;
  },
): string[] {
  const args: string[] = ["-i", inputName, "-movflags", "+faststart", "-pix_fmt", "yuv420p"];

  args.push(
    "-vf",
    `scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=${opts.fps}`,
  );

  if (opts.outputFormat === "webm") {
    args.push("-deadline", "realtime", "-cpu-used", "8");
  }

  args.push(outputName);
  return args;
}

export function getMimeType(format: string): string {
  switch (format) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return "application/octet-stream";
  }
}
