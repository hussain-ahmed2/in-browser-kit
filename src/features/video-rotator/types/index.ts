import * as z from "zod";

export const videoRotatorSchema = z.enum(["90", "180", "270", "horizontal", "vertical"]);

export type VideoRotation = z.infer<typeof videoRotatorSchema>;

export interface VideoRotatorResult {
  originalFile: File;
  convertedFile: File;
  objectUrl: string;
}
