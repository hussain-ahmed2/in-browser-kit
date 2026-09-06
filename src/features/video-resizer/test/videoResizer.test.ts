import { describe, expect, it } from "vitest";
import { buildVideoResizerArgs } from "../lib/videoResizer";

describe("buildVideoResizerArgs", () => {
  it("generates correct args with aspect ratio maintained", () => {
    const args = buildVideoResizerArgs("input.mp4", "output.mp4", {
      width: 1280,
      height: 720,
      maintainAspectRatio: true,
    });
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2",
      "-c:a",
      "copy",
      "output.mp4",
    ]);
  });

  it("generates correct args without aspect ratio lock", () => {
    const args = buildVideoResizerArgs("input.mp4", "output.mp4", {
      width: 1920,
      height: 1080,
      maintainAspectRatio: false,
    });
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "scale=1920:1080",
      "-c:a",
      "copy",
      "output.mp4",
    ]);
  });

  it("handles small dimensions", () => {
    const args = buildVideoResizerArgs("clip.mov", "small.mov", {
      width: 320,
      height: 240,
      maintainAspectRatio: true,
    });
    expect(args).toEqual([
      "-i",
      "clip.mov",
      "-vf",
      "scale=320:240:force_original_aspect_ratio=decrease,pad=320:240:(ow-iw)/2:(oh-ih)/2",
      "-c:a",
      "copy",
      "small.mov",
    ]);
  });
});
