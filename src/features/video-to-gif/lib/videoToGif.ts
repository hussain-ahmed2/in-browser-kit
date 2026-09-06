export function buildVideoToGifArgs(
  inputName: string,
  outputName: string,
  opts: {
    startTime: string;
    duration: string;
    fps: number;
    width: number;
  },
): string[] {
  const args: string[] = [];

  if (opts.startTime && opts.startTime !== "00:00:00") {
    args.push("-ss", opts.startTime);
  }

  args.push("-i", inputName);

  if (opts.duration) {
    args.push("-t", opts.duration);
  }

  args.push(
    "-vf",
    `fps=${opts.fps},scale=${opts.width}:-1:flags=lanczos`,
    "-loop",
    "0",
  );

  args.push(outputName);
  return args;
}

export function getMimeType(): string {
  return "image/gif";
}
