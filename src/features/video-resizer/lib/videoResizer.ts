export function buildVideoResizerArgs(
  inputName: string,
  outputName: string,
  opts: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  },
): string[] {
  const args: string[] = ["-i", inputName];

  if (opts.maintainAspectRatio) {
    args.push(
      "-vf",
      `scale=${opts.width}:${opts.height}:force_original_aspect_ratio=decrease,pad=${opts.width}:${opts.height}:(ow-iw)/2:(oh-ih)/2`,
    );
  } else {
    args.push("-vf", `scale=${opts.width}:${opts.height}`);
  }

  args.push("-c:a", "copy", outputName);
  return args;
}
