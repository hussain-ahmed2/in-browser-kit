import * as z from 'zod'

export const gifMakerSchema = z.object({
  frameDelay: z.coerce.number().int().min(10).max(5000).default(100),
  loopCount: z.coerce.number().int().min(0).max(100).default(0),
  width: z.coerce.number().int().min(16).max(4096).optional(),
  height: z.coerce.number().int().min(16).max(4096).optional(),
  backgroundColor: z.string().default('#ffffff'),
})

export type GifMakerFormValues = z.input<typeof gifMakerSchema>