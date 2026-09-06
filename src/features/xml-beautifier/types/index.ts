import * as z from 'zod'

export const xmlBeautifierSchema = z.object({
  input: z.string().default(''),
  indent: z.coerce.number().int().min(1).max(8).default(2),
})

export type XmlBeautifierFormValues = z.input<typeof xmlBeautifierSchema>
