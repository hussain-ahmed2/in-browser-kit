import { describe, expect, it } from "vitest";
import {
  buildVideoToAudioArgs,
  getMimeType,
  getFileExtension,
} from "../lib/videoToAudio";

describe("buildVideoToAudioArgs", () => {
  it("generates correct args for MP3 output", () => {
    const args = buildVideoToAudioArgs("input.mp4", "output.mp3", "mp3");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vn",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "192k",
      "output.mp3",
    ]);
  });

  it("generates correct args for WAV output", () => {
    const args = buildVideoToAudioArgs("input.mp4", "output.wav", "wav");
    expect(args).toEqual(["-i", "input.mp4", "-vn", "output.wav"]);
  });

  it("generates correct args for AAC output (copy codec)", () => {
    const args = buildVideoToAudioArgs("input.mp4", "output.aac", "aac");
    expect(args).toEqual([
      "-i",
      "input.mp4",
      "-vn",
      "-c:a",
      "copy",
      "output.aac",
    ]);
  });

  it("generates correct args for OGG output", () => {
    const args = buildVideoToAudioArgs("input.webm", "output.ogg", "ogg");
    expect(args).toEqual([
      "-i",
      "input.webm",
      "-vn",
      "-codec:a",
      "libvorbis",
      "-b:a",
      "192k",
      "output.ogg",
    ]);
  });

  it("works with MOV input", () => {
    const args = buildVideoToAudioArgs("clip.mov", "audio.mp3", "mp3");
    expect(args).toEqual([
      "-i",
      "clip.mov",
      "-vn",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "192k",
      "audio.mp3",
    ]);
  });
});

describe("getMimeType", () => {
  it("returns audio/mpeg for mp3", () => {
    expect(getMimeType("mp3")).toBe("audio/mpeg");
  });

  it("returns audio/wav for wav", () => {
    expect(getMimeType("wav")).toBe("audio/wav");
  });

  it("returns audio/aac for aac", () => {
    expect(getMimeType("aac")).toBe("audio/aac");
  });

  it("returns audio/ogg for ogg", () => {
    expect(getMimeType("ogg")).toBe("audio/ogg");
  });

  it("returns application/octet-stream for unknown", () => {
    expect(getMimeType("unknown")).toBe("application/octet-stream");
  });
});

describe("getFileExtension", () => {
  it("returns .mp3 for mp3", () => {
    expect(getFileExtension("mp3")).toBe(".mp3");
  });

  it("returns .wav for wav", () => {
    expect(getFileExtension("wav")).toBe(".wav");
  });

  it("returns .aac for aac", () => {
    expect(getFileExtension("aac")).toBe(".aac");
  });

  it("returns .ogg for ogg", () => {
    expect(getFileExtension("ogg")).toBe(".ogg");
  });

  it("defaults to .mp3 for unknown", () => {
    expect(getFileExtension("unknown")).toBe(".mp3");
  });
});
