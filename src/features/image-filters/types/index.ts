import * as z from 'zod'

export const filtersSchema = z.object({
  brightness: z.number().int().min(-100).max(100).default(0),
  contrast: z.number().int().min(-100).max(100).default(0),
  saturation: z.number().int().min(0).max(200).default(100),
  blur: z.number().min(0).max(20).default(0),
  grayscale: z.number().int().min(0).max(100).default(0),
  sepia: z.number().int().min(0).max(100).default(0),
  hueRotate: z.number().int().min(0).max(360).default(0),
  invert: z.number().int().min(0).max(100).default(0),
})

export type FiltersFormValues = z.input<typeof filtersSchema>