import * as z from 'zod'

export const svgToJpgSchema = z.object({
  scale: z.number().min(1).max(4).default(1),
  backgroundColor: z.string().default('#ffffff'),
})

export type SvgToJpgFormValues = z.input<typeof svgToJpgSchema>
