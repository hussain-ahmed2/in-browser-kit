import * as z from 'zod'

export const borderSchema = z.object({
  borderWidth: z.coerce.number().int().min(1).max(100).default(10),
  borderColor: z.string().default('#000000'),
  borderRadius: z.coerce.number().int().min(0).max(200).default(0),
  style: z.enum(['solid', 'double', 'dashed', 'dotted']).default('solid'),
})

export type BorderFormValues = z.input<typeof borderSchema>

export type BorderStyle = 'solid' | 'double' | 'dashed' | 'dotted'
