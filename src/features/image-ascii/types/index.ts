import * as z from 'zod'

export const asciiSchema = z.object({
  width: z.coerce.number().int().min(20).max(300).default(100),
  charset: z.string().default(' .:-=+*#%@'),
  colored: z.boolean().default(false),
})

export type AsciiFormValues = z.input<typeof asciiSchema>

export const ASCII_CHARSETS = [
  { label: 'Simple', value: ' .:-=+*#%@' },
  { label: 'Detailed', value: ' .,:;i1tfLCG08@' },
  { label: 'Blocks', value: ' ░▒▓█' },
  { label: 'Dots', value: ' ·•●' },
  { label: 'Binary', value: ' 01' },
] as const
