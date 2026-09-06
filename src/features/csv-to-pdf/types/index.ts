import * as z from 'zod'

export const csvToPdfSchema = z.object({
  csv: z.string().default(''),
  pageSize: z.enum(['a4', 'letter']).default('a4'),
})

export type CsvToPdfFormValues = z.input<typeof csvToPdfSchema>
