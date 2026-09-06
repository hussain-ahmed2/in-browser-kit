import * as z from 'zod'

export const cssGradientSchema = z.object({
  type: z.enum(['linear', 'radial']).default('linear'),
  colors: z.array(z.string()).default(['#667eea', '#764ba2']),
  angle: z.number().min(0).max(360).default(135),
})

export type CssGradientFormValues = z.input<typeof cssGradientSchema>
