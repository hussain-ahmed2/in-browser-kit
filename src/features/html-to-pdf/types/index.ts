import * as z from 'zod'

export const htmlToPdfSchema = z.object({
  html: z.string().default(''),
  pageSize: z.enum(['a4', 'letter']).default('a4'),
})

export type HtmlToPdfFormValues = z.input<typeof htmlToPdfSchema>
