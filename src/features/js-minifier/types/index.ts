import * as z from 'zod'

export const jsMinifierSchema = z.object({
  javascript: z.string().default(''),
})

export type JsMinifierFormValues = z.input<typeof jsMinifierSchema>
