import * as z from "zod";

export const videoMuteSchema = z.object({
  outputFormat: z.enum(["mp4", "webm"]).default("mp4"),
});

export type VideoMuteFormValues = z.input<typeof videoMuteSchema>;

export interface VideoMuteResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
