import * as z from 'zod'

export const formatConverterSchema = z.object({
  format: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/bmp']),
  quality: z.number().min(0.1).max(1).default(0.9),
})

export type FormatConverterFormValues = z.input<typeof formatConverterSchema>