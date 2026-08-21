import * as z from 'zod';

export const mediaConversionSchema = z.object({
    outputFormat: z.enum(['mp4', 'webm', 'mp3', 'wav', 'gif']),
    quality: z.enum(['high', 'medium', 'low']).default('medium'),
    trimStart: z.string().optional(),
    trimEnd: z.string().optional(),
    useHardwareAcceleration: z.boolean().default(true),
});

export type MediaConversionFormValues = z.input<typeof mediaConversionSchema>;
export type MediaConversionFormOutput = z.output<typeof mediaConversionSchema>;

export interface MediaConversionResult {
    originalFile: File;
    convertedFile: File;
}
