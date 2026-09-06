import { describe, expect, it } from "vitest";
import { buildVideoMuteArgs, getMimeType } from "../lib/videoMute";

describe("buildVideoMuteArgs", () => {
  it("generates correct args for MP4", () => {
    const args = buildVideoMuteArgs("input.mp4", "output.mp4");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-an",
      "-c:v",
      "copy",
      "output.mp4",
    ]);
  });

  it("generates correct args for WebM", () => {
    const args = buildVideoMuteArgs("input.webm", "output.webm");
    expect(args).toEqual([
      "-i",
      "input.webm",
      "-an",
      "-c:v",
      "copy",
      "output.webm",
    ]);
  });

  it("generates correct args for MOV input", () => {
    const args = buildVideoMuteArgs("clip.mov", "clip_muted.mov");
    expect(args).toEqual([
      "-i",
      "clip.mov",
      "-an",
      "-c:v",
      "copy",
      "clip_muted.mov",
    ]);
  });
});

describe("getMimeType", () => {
  it("returns video/mp4 for mp4", () => {
    expect(getMimeType("mp4")).toBe("video/mp4");
  });

  it("returns video/webm for webm", () => {
    expect(getMimeType("webm")).toBe("video/webm");
  });

  it("returns video/mp4 for unknown format", () => {
    expect(getMimeType("unknown")).toBe("video/mp4");
  });
});
