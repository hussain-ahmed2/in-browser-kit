import * as z from 'zod'

export const svgToPngSchema = z.object({
  scale: z.number().min(1).max(4).default(1),
})

export type SvgToPngFormValues = z.input<typeof svgToPngSchema>
