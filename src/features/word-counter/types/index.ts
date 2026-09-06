import * as z from 'zod'

export const wordCounterSchema = z.object({
  text: z.string().default(''),
})

export type WordCounterFormValues = z.input<typeof wordCounterSchema>
