import * as z from 'zod'

export const markdownPreviewSchema = z.object({
  markdown: z.string().default(''),
})

export type MarkdownPreviewFormValues = z.input<typeof markdownPreviewSchema>
