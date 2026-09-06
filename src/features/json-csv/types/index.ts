import * as z from 'zod'

export const jsonCsvSchema = z.object({
  input: z.string().default(''),
})

export type JsonCsvFormValues = z.input<typeof jsonCsvSchema>
