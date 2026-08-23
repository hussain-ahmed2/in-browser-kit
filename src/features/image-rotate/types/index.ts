import * as z from 'zod'

export const rotateSchema = z.object({
  degrees: z.coerce.number().min(0).max(360).multipleOf(90),
  flip: z.enum(['none', 'horizontal', 'vertical']).optional(),
})

export type RotateFormValues = z.input<typeof rotateSchema>
