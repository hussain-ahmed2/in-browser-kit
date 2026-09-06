import type { VideoRotation } from "../types";

export function buildVideoRotatorArgs(
  inputName: string,
  outputName: string,
  rotation: VideoRotation,
): string[] {
  const args: string[] = ["-i", inputName];

  switch (rotation) {
    case "90":
      args.push("-vf", "transpose=1");
      break;
    case "180":
      args.push("-vf", "transpose=1,transpose=1");
      break;
    case "270":
      args.push("-vf", "transpose=2");
      break;
    case "horizontal":
      args.push("-vf", "hflip");
      break;
    case "vertical":
      args.push("-vf", "vflip");
      break;
  }

  args.push(outputName);
  return args;
}
