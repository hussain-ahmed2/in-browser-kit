import * as z from "zod";

export const videoResizerSchema = z.object({
  width: z.number().min(1).max(7680).default(1280),
  height: z.number().min(1).max(4320).default(720),
  maintainAspectRatio: z.boolean().default(true),
});

export type VideoResizerFormValues = z.input<typeof videoResizerSchema>;

export interface VideoResizerResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
