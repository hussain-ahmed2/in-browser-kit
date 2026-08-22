import * as z from 'zod'

export const POSITION_VALUES = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const

export type PositionPreset = (typeof POSITION_VALUES)[number]

export const watermarkerSchema = z.object({
  type: z.enum(['text', 'logo']),
  text: z.string().min(1),
  fontSizePct: z.number().min(1).max(30),
  bold: z.boolean(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use hex color like #ffffff'),
  logoScalePct: z.number().min(5).max(60),
  positionMode: z.enum(['preset', 'custom']),
  preset: z.enum(POSITION_VALUES),
  customX: z.number().min(0).max(100),
  customY: z.number().min(0).max(100),
  marginPct: z.number().min(0).max(25),
  opacityPct: z.number().min(5).max(100),
  rotationDeg: z.number().min(-180).max(180),
  format: z.enum(['keep', 'image/jpeg', 'image/png', 'image/webp']),
  quality: z.number().min(0.1).max(1),
})

export type WatermarkSettings = z.infer<typeof watermarkerSchema>
export type WatermarkType = WatermarkSettings['type']
export type OutputFormat = WatermarkSettings['format']