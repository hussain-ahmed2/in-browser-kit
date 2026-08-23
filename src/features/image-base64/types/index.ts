import * as z from 'zod'

export const base64Schema = z.object({
  outputFormat: z.enum(['data-url', 'base64-only', 'file']),
})

export type Base64FormValues = z.input<typeof base64Schema>
