import * as z from 'zod'

export const ocrSchema = z.object({
  language: z.string().default('eng'),
})

export type OcrFormValues = z.input<typeof ocrSchema>
