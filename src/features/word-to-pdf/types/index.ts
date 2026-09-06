import * as z from 'zod'

export const wordToPdfSchema = z.object({})

export type WordToPdfFormValues = z.input<typeof wordToPdfSchema>
