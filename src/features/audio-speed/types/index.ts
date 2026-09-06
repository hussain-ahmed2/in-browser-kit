import * as z from 'zod'

export const audioSpeedSchema = z.object({
  speed: z.number().min(0.25).max(4).default(1),
})

export type AudioSpeedFormValues = z.input<typeof audioSpeedSchema>
