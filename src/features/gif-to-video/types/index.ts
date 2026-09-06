import * as z from "zod";

export const gifToVideoSchema = z.object({
  outputFormat: z.enum(["mp4", "webm"]).default("mp4"),
  fps: z.number().min(1).max(30).default(15),
});

export type GifToVideoFormValues = z.input<typeof gifToVideoSchema>;

export interface GifToVideoResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
