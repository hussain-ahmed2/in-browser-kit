import * as z from 'zod'

export const overlaySchema = z.object({
  opacity: z.coerce.number().min(0).max(100).default(80),
  blendMode: z.string().default('source-over'),
  position: z.enum(['center', 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'tile']).default('center'),
  scale: z.coerce.number().min(10).max(200).default(100),
})

export type OverlayFormValues = z.input<typeof overlaySchema>

export const BLEND_MODES = [
  { label: 'Normal', value: 'source-over' },
  { label: 'Multiply', value: 'multiply' },
  { label: 'Screen', value: 'screen' },
  { label: 'Overlay', value: 'overlay' },
  { label: 'Darken', value: 'darken' },
  { label: 'Lighten', value: 'lighten' },
  { label: 'Color Dodge', value: 'color-dodge' },
  { label: 'Color Burn', value: 'color-burn' },
  { label: 'Hard Light', value: 'hard-light' },
  { label: 'Soft Light', value: 'soft-light' },
  { label: 'Difference', value: 'difference' },
  { label: 'Exclusion', value: 'exclusion' },
] as const

export const POSITION_OPTIONS = [
  { label: 'Center', value: 'center' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Right', value: 'bottom-right' },
  { label: 'Tile', value: 'tile' },
] as const
