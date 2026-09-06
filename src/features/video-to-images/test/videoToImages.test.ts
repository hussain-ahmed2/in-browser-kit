import { describe, expect, it } from "vitest";
import {
  buildVideoToImagesArgs,
  getOutputPattern,
  getMimeType,
} from "../lib/videoToImages";

describe("buildVideoToImagesArgs", () => {
  it("generates correct args for PNG at 1 fps", () => {
    const args = buildVideoToImagesArgs("input.mp4", "output_%04d.png", {
      fps: 1,
      format: "png",
    });
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "fps=1",
      "output_%04d.png",
    ]);
  });

  it("generates correct args for JPG at 10 fps", () => {
    const args = buildVideoToImagesArgs("video.mov", "output_%04d.jpg", {
      fps: 10,
      format: "jpg",
    });
    expect(args).toEqual([
      "-i",
      "video.mov",
      "-vf",
      "fps=10",
      "output_%04d.jpg",
    ]);
  });

  it("handles fractional fps", () => {
    const args = buildVideoToImagesArgs("clip.mp4", "output_%04d.png", {
      fps: 0.5,
      format: "png",
    });
    expect(args).toEqual([
      "-i",
      "clip.mp4",
      "-vf",
      "fps=0.5",
      "output_%04d.png",
    ]);
  });
});

describe("getOutputPattern", () => {
  it("returns correct pattern for png", () => {
    expect(getOutputPattern("png")).toBe("output_%04d.png");
  });

  it("returns correct pattern for jpg", () => {
    expect(getOutputPattern("jpg")).toBe("output_%04d.jpg");
  });
});

describe("getMimeType", () => {
  it("returns image/png for png", () => {
    expect(getMimeType("png")).toBe("image/png");
  });

  it("returns image/jpeg for jpg", () => {
    expect(getMimeType("jpg")).toBe("image/jpeg");
  });
});
