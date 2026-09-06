export function buildVideoMuteArgs(
  inputName: string,
  outputName: string,
): string[] {
  return ["-i", inputName, "-an", "-c:v", "copy", outputName];
}

export function getMimeType(format: string): string {
  switch (format) {
    case "mp4":
      return "video/mp4";
    case "webm":
      return "video/webm";
    default:
      return "video/mp4";
  }
}
