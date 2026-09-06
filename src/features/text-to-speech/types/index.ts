import * as z from 'zod'

export const textToSpeechSchema = z.object({
  text: z.string().default(''),
  voice: z.string().default(''),
  rate: z.number().min(0.1).max(3).default(1),
  pitch: z.number().min(0).max(2).default(1),
})

export type TextToSpeechFormValues = z.input<typeof textToSpeechSchema>
