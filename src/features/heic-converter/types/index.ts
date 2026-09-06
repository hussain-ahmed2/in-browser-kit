import * as z from 'zod'

export const heicConverterSchema = z.object({
  format: z.enum(['image/jpeg', 'image/png']).default('image/jpeg'),
  quality: z.number().min(0.1).max(1.0).default(0.9),
})

export type HeicConverterFormValues = z.input<typeof heicConverterSchema>
