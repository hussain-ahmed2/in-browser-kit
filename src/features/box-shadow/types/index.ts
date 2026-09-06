import * as z from 'zod'

export const boxShadowSchema = z.object({
  offsetX: z.number().default(0),
  offsetY: z.number().default(4),
  blur: z.number().default(16),
  spread: z.number().default(0),
  color: z.string().default('#000000'),
  inset: z.boolean().default(false),
})

export type BoxShadowFormValues = z.input<typeof boxShadowSchema>
