import { describe, expect, it } from "vitest";
import { buildGifToVideoArgs, getMimeType } from "../lib/gifToVideo";

describe("buildGifToVideoArgs", () => {
  it("generates correct args for MP4 output", () => {
    const args = buildGifToVideoArgs("input.gif", "output.mp4", {
      outputFormat: "mp4",
      fps: 15,
    });
    expect(args).toEqual([
      "-i",
      "input.gif",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=15",
      "output.mp4",
    ]);
  });

  it("generates correct args for WebM output", () => {
    const args = buildGifToVideoArgs("input.gif", "output.webm", {
      outputFormat: "webm",
      fps: 10,
    });
    expect(args).toEqual([
      "-i",
      "input.gif",
      "-movflags",
      "+faststart",
      "-pix_fmt",
      "yuv420p",
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=10",
      "-deadline",
      "realtime",
      "-cpu-used",
      "8",
      "output.webm",
    ]);
  });

  it("handles different fps values", () => {
    const args = buildGifToVideoArgs("anim.gif", "out.mp4", {
      outputFormat: "mp4",
      fps: 30,
    });
    const vfArg = args.find((a) => a.includes("fps="));
    expect(vfArg).toContain("fps=30");
  });
});

describe("getMimeType", () => {
  it("returns video/mp4 for mp4", () => {
    expect(getMimeType("mp4")).toBe("video/mp4");
  });

  it("returns video/webm for webm", () => {
    expect(getMimeType("webm")).toBe("video/webm");
  });

  it("returns application/octet-stream for unknown", () => {
    expect(getMimeType("unknown")).toBe("application/octet-stream");
  });
});
