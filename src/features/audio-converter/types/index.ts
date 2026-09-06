import * as z from 'zod'

export const audioConverterSchema = z.object({
  outputFormat: z.enum(['mp3', 'wav', 'ogg', 'aac', 'flac']).default('mp3'),
})

export type AudioConverterFormValues = z.input<typeof audioConverterSchema>
