import * as z from 'zod'

export const loremIpsumSchema = z.object({
  type: z.enum(['paragraphs', 'sentences', 'words']).default('paragraphs'),
  count: z.coerce.number().int().min(1).max(100).default(3),
  startWithLorem: z.boolean().default(true),
})

export type LoremIpsumFormValues = z.input<typeof loremIpsumSchema>
