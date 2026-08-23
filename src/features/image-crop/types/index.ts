import * as z from 'zod'

export const cropSchema = z.object({
  aspectRatio: z.enum(['free', '1:1', '4:3', '16:9', '3:2', '9:16']),
})

export type CropFormValues = z.input<typeof cropSchema>
