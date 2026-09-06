import * as z from 'zod'

export const audioTrimmerSchema = z.object({
  startTime: z.string().default('00:00:00'),
  duration: z.string().default('00:00:10'),
  outputFormat: z.string().default('mp3'),
})

export type AudioTrimmerFormValues = z.input<typeof audioTrimmerSchema>
