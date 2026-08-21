import * as z from 'zod';

export const mediaConversionSchema = z.object({
    outputFormat: z.enum(['mp4', 'webm', 'mp3', 'wav', 'gif']),
    resolution: z.enum(['original', '1080p', '720p', '480p', '360p']).default('original'),
    quality: z.enum(['high', 'medium', 'low']).default('medium'),
    filter: z.enum(['none', 'grayscale', 'sepia', 'invert', 'blur']).default('none'),
    saveMode: z.enum(['direct', 'memory']).default('direct'),
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
