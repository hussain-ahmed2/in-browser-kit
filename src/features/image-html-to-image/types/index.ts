import * as z from 'zod'

export const htmlToImageSchema = z.object({
  html: z.string().min(1, 'HTML is required'),
  width: z.coerce.number().int().min(100).max(4000).default(800),
  height: z.coerce.number().int().min(100).max(4000).default(600),
  backgroundColor: z.string().default('#ffffff'),
})

export type HtmlToImageFormValues = z.input<typeof htmlToImageSchema>
