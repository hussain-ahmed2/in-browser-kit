import * as z from "zod";

export const videoToImagesSchema = z.object({
  fps: z.number().min(0.1).max(30).default(1),
  format: z.enum(["png", "jpg"]).default("png"),
});

export type VideoToImagesFormValues = z.input<typeof videoToImagesSchema>;

export interface VideoToImagesResult {
  originalFile: File;
  frames: { name: string; blob: Blob; objectUrl: string }[];
}
