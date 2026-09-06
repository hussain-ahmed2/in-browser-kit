import * as z from "zod";

export const videoToAudioSchema = z.object({
  format: z.enum(["mp3", "wav", "aac", "ogg"]).default("mp3"),
});

export type VideoToAudioFormValues = z.input<typeof videoToAudioSchema>;

export interface VideoToAudioResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
