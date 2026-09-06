import * as z from 'zod'

export const markdownToPdfSchema = z.object({
  markdown: z.string().default(''),
})

export type MarkdownToPdfFormValues = z.input<typeof markdownToPdfSchema>
