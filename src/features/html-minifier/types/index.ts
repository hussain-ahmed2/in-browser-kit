import * as z from 'zod'

export const htmlMinifierSchema = z.object({
  html: z.string().default(''),
})

export type HtmlMinifierFormValues = z.input<typeof htmlMinifierSchema>
