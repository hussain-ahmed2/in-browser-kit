export function buildVideoToAudioArgs(
  inputName: string,
  outputName: string,
  format: "mp3" | "wav" | "aac" | "ogg",
): string[] {
  const args: string[] = ["-i", inputName, "-vn"];

  switch (format) {
    case "mp3":
      args.push("-codec:a", "libmp3lame", "-b:a", "192k");
      break;
    case "wav":
      // No codec args needed — WAV is raw PCM
      break;
    case "aac":
      args.push("-c:a", "copy");
      break;
    case "ogg":
      args.push("-codec:a", "libvorbis", "-b:a", "192k");
      break;
  }

  args.push(outputName);
  return args;
}

export function getMimeType(format: string): string {
  switch (format) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "aac":
      return "audio/aac";
    case "ogg":
      return "audio/ogg";
    default:
      return "application/octet-stream";
  }
}

export function getFileExtension(format: string): string {
  switch (format) {
    case "mp3":
      return ".mp3";
    case "wav":
      return ".wav";
    case "aac":
      return ".aac";
    case "ogg":
      return ".ogg";
    default:
      return ".mp3";
  }
}
