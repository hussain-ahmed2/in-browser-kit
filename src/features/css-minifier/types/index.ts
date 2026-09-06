import * as z from 'zod'

export const cssMinifierSchema = z.object({
  input: z.string().default(''),
})

export type CssMinifierFormValues = z.input<typeof cssMinifierSchema>
