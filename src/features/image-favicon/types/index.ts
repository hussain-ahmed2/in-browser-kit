import * as z from 'zod'

export const faviconSchema = z.object({
  mode: z.enum(['crop', 'pad', 'transparent']).default('transparent'),
  backgroundColor: z.string().default('#ffffff'),
  selectedSizes: z.array(z.number()).default([
    16, 32, 48, 64, 128, 256, 512, 180, 192, 512,
  ]),
})

export type FaviconFormValues = z.input<typeof faviconSchema>