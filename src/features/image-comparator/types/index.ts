import * as z from 'zod'

export const compareSchema = z.object({
  mode: z.enum(['side-by-side', 'overlay', 'diff']).default('side-by-side'),
  overlayOpacity: z.coerce.number().min(0).max(100).default(50),
  diffThreshold: z.coerce.number().int().min(0).max(255).default(0),
})

export type CompareFormValues = z.input<typeof compareSchema>

export type CompareMode = 'side-by-side' | 'overlay' | 'diff'
