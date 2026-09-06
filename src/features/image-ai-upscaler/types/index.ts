import * as z from 'zod'

export const aiUpscalerSchema = z.object({
  scale: z.enum(['2x', '4x']).default('2x'),
})

export type AiUpscalerFormValues = z.input<typeof aiUpscalerSchema>
