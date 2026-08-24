import * as z from 'zod'

export const gifExtractorSchema = z.object({})

export type GifExtractorFormValues = z.input<typeof gifExtractorSchema>