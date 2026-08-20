import * as z from 'zod';

export const compressorSchema = z.object({
    maxSizeMB: z.number().min(0.1, 'Must be at least 0.1 MB'),
    maxWidth: z.number().min(100, 'Must be at least 100px'),
    initialQuality: z.number().min(0.1).max(1.0),
    alwaysKeepResolution: z.boolean(),
    fileType: z.string()
});

export type CompressorFormValues = z.infer<typeof compressorSchema>;

export interface CompressionResult {
    originalFile: File;
    compressedFile: File;
}
