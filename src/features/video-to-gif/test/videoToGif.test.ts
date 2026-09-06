import { describe, expect, it } from "vitest";
import { buildVideoToGifArgs } from "../lib/videoToGif";

describe("buildVideoToGifArgs", () => {
  it("generates correct args with default values", () => {
    const args = buildVideoToGifArgs("input.mp4", "output.gif", {
      startTime: "00:00:00",
      duration: "00:00:05",
      fps: 10,
      width: 480,
    });
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-t",
      "00:00:05",
      "-vf",
      "fps=10,scale=480:-1:flags=lanczos",
      "-loop",
      "0",
      "output.gif",
    ]);
  });

  it("includes -ss when startTime is not 00:00:00", () => {
    const args = buildVideoToGifArgs("input.mp4", "output.gif", {
      startTime: "00:00:10",
      duration: "00:00:03",
      fps: 15,
      width: 320,
    });
    expect(args).toEqual([
      "-ss",
      "00:00:10",
      "-i",
      "input.mp4",
      "-t",
      "00:00:03",
      "-vf",
      "fps=15,scale=320:-1:flags=lanczos",
      "-loop",
      "0",
      "output.gif",
    ]);
  });

  it("handles high fps and large width", () => {
    const args = buildVideoToGifArgs("clip.mov", "result.gif", {
      startTime: "00:01:00",
      duration: "00:00:10",
      fps: 30,
      width: 1024,
    });
    expect(args).toEqual([
      "-ss",
      "00:01:00",
      "-i",
      "clip.mov",
      "-t",
      "00:00:10",
      "-vf",
      "fps=30,scale=1024:-1:flags=lanczos",
      "-loop",
      "0",
      "result.gif",
    ]);
  });
});
