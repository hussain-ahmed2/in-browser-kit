import * as z from 'zod'

const gradientStopSchema = z.object({
  color: z.string().min(1),
  position: z.number().min(0).max(100),
})

export const placeholderSchema = z.object({
  width: z.coerce.number().int().min(16).max(4096),
  height: z.coerce.number().int().min(16).max(4096),
  style: z.enum(['solid', 'gradient', 'pattern', 'text', 'noise']),
  color: z.string().min(1),
  color2: z.string().min(1).optional(),
  text: z.string().optional(),
  textColor: z.string().min(1).optional(),
  fontSize: z.coerce.number().int().min(8).max(256).optional(),
  gradientType: z.enum(['linear', 'radial', 'conic']).optional(),
  gradientAngle: z.coerce.number().min(0).max(360).optional(),
  gradientStops: z.array(gradientStopSchema).optional(),
})

export type PlaceholderFormValues = z.input<typeof placeholderSchema>
