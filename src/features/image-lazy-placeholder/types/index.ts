import * as z from 'zod'

export const lazyPlaceholderSchema = z.object({
  targetWidth: z.coerce.number().int().min(4).max(100).default(20),
  format: z.enum(['webp', 'png', 'jpeg']).default('webp'),
  quality: z.coerce.number().min(0.1).max(1).default(0.6),
})

export type LazyPlaceholderFormValues = z.input<typeof lazyPlaceholderSchema>
