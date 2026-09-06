import * as z from 'zod'

export const caseConverterSchema = z.object({
  text: z.string().default(''),
})

export type CaseConverterFormValues = z.input<typeof caseConverterSchema>
