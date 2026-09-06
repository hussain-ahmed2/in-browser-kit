import * as z from 'zod'

export const cssSpriteSchema = z.object({
  gap: z.coerce.number().int().min(0).max(20).default(0),
  layout: z.enum(['horizontal', 'grid', 'auto']).default('auto'),
})

export type CssSpriteFormValues = z.input<typeof cssSpriteSchema>
