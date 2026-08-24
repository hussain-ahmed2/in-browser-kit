import * as z from 'zod'

export const gifOptimizerSchema = z.object({
  maxColors: z.coerce.number().int().min(2).max(256).default(256),
  removeDuplicates: z.boolean().default(true),
  lossyLevel: z.coerce.number().int().min(0).max(100).default(10),
  optimizeFrames: z.boolean().default(true),
})

export type GifOptimizerFormValues = z.input<typeof gifOptimizerSchema>