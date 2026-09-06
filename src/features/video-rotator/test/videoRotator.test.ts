import { describe, expect, it } from "vitest";
import { buildVideoRotatorArgs } from "../lib/videoRotator";

describe("buildVideoRotatorArgs", () => {
  it("generates correct args for 90° rotation", () => {
    const args = buildVideoRotatorArgs("input.mp4", "output.mp4", "90");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "transpose=1",
      "output.mp4",
    ]);
  });

  it("generates correct args for 180° rotation", () => {
    const args = buildVideoRotatorArgs("input.mp4", "output.mp4", "180");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "transpose=1,transpose=1",
      "output.mp4",
    ]);
  });

  it("generates correct args for 270° rotation", () => {
    const args = buildVideoRotatorArgs("input.mp4", "output.mp4", "270");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "transpose=2",
      "output.mp4",
    ]);
  });

  it("generates correct args for horizontal flip", () => {
    const args = buildVideoRotatorArgs("input.mp4", "output.mp4", "horizontal");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "hflip",
      "output.mp4",
    ]);
  });

  it("generates correct args for vertical flip", () => {
    const args = buildVideoRotatorArgs("input.mp4", "output.mp4", "vertical");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vf",
      "vflip",
      "output.mp4",
    ]);
  });
});
