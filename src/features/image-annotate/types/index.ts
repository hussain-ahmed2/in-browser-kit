import * as z from 'zod'

export const annotateSchema = z.object({
  strokeWidth: z.coerce.number().int().min(1).max(20).default(3),
  color: z.string().default('#ff0000'),
  fontSize: z.coerce.number().int().min(8).max(72).default(24),
})

export type AnnotateFormValues = z.input<typeof annotateSchema>

export type AnnotateTool = 'arrow' | 'rectangle' | 'circle' | 'text' | 'line' | 'freehand'

export const ANNOTATE_TOOLS: { label: string; value: AnnotateTool }[] = [
  { label: 'Arrow', value: 'arrow' },
  { label: 'Rectangle', value: 'rectangle' },
  { label: 'Circle', value: 'circle' },
  { label: 'Line', value: 'line' },
  { label: 'Text', value: 'text' },
  { label: 'Freehand', value: 'freehand' },
]

export interface Annotation {
  id: string
  type: AnnotateTool
  x: number
  y: number
  x2: number
  y2: number
  text?: string
  color: string
  strokeWidth: number
  fontSize?: number
  points?: { x: number; y: number }[]
}
