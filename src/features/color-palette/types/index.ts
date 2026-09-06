import * as z from 'zod'

export const colorPaletteSchema = z.object({
  colorCount: z.number().int().min(2).max(12).default(5),
})

export type ColorPaletteFormValues = z.input<typeof colorPaletteSchema>
