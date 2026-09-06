import * as z from 'zod'

export const dropShadowSchema = z.object({
  offsetX: z.coerce.number().int().min(-100).max(100).default(4),
  offsetY: z.coerce.number().int().min(-100).max(100).default(4),
  blur: z.coerce.number().int().min(0).max(50).default(10),
  color: z.string().default('#000000'),
  opacity: z.coerce.number().min(0).max(100).default(50),
  spread: z.coerce.number().int().min(0).max(50).default(0),
})

export type DropShadowFormValues = z.input<typeof dropShadowSchema>
