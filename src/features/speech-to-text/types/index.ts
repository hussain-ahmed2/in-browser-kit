import * as z from 'zod'

export const speechToTextSchema = z.object({
  language: z.string().default('en-US'),
})

export type SpeechToTextFormValues = z.input<typeof speechToTextSchema>
