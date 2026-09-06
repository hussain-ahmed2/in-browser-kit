import * as z from 'zod'

export const pdfToMarkdownSchema = z.object({})

export type PdfToMarkdownFormValues = z.input<typeof pdfToMarkdownSchema>
