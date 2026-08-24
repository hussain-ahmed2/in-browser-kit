import * as z from 'zod'

export const cropSchema = z.object({
  aspectRatio: z.enum(['free', '1:1', '4:3', '16:9', '3:2', '9:16', '4:5', '1:2', 'custom']),
  customRatio: z.string().optional(),
})

export type CropFormValues = z.input<typeof cropSchema>