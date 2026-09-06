import * as z from 'zod'

export const memeSchema = z.object({
  topText: z.string().default(''),
  bottomText: z.string().default(''),
  fontSize: z.coerce.number().int().min(12).max(120).default(48),
  fontFamily: z.string().default('Impact'),
  textColor: z.string().default('#ffffff'),
  strokeColor: z.string().default('#000000'),
  strokeWidth: z.coerce.number().int().min(0).max(10).default(3),
})

export type MemeFormValues = z.input<typeof memeSchema>

export const MEME_FONTS = [
  'Impact',
  'Arial Black',
  'Comic Sans MS',
  'Verdana',
  'Georgia',
  'Times New Roman',
] as const
