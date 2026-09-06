import * as z from "zod";

export const videoToGifSchema = z.object({
  startTime: z.string().default("00:00:00"),
  duration: z.string().default("00:00:05"),
  fps: z.number().min(1).max(30).default(10),
  width: z.number().min(32).max(1920).default(480),
});

export type VideoToGifFormValues = z.input<typeof videoToGifSchema>;

export interface VideoToGifResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
