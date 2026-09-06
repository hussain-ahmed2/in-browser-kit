import * as z from 'zod'

export const collageSchema = z.object({
  layout: z.enum(['grid-2x2', 'grid-3x3', 'horizontal', 'vertical', 'mosaic']).default('grid-2x2'),
  gap: z.coerce.number().int().min(0).max(50).default(8),
  padding: z.coerce.number().int().min(0).max(50).default(16),
  backgroundColor: z.string().default('#ffffff'),
})

export type CollageFormValues = z.input<typeof collageSchema>

export type CollageLayout = 'grid-2x2' | 'grid-3x3' | 'horizontal' | 'vertical' | 'mosaic'

export const LAYOUT_OPTIONS = [
  { label: '2×2 Grid', value: 'grid-2x2' },
  { label: '3×3 Grid', value: 'grid-3x3' },
  { label: 'Horizontal Strip', value: 'horizontal' },
  { label: 'Vertical Strip', value: 'vertical' },
  { label: 'Mosaic', value: 'mosaic' },
] as const

export const MIN_IMAGES: Record<CollageLayout, number> = {
  'grid-2x2': 2,
  'grid-3x3': 2,
  horizontal: 2,
  vertical: 2,
  mosaic: 3,
}
