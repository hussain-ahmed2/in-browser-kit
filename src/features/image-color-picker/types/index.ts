import type { ColorInfo } from '../lib/imageColorPicker'

export type CursorMode = 'crosshair' | 'magnifier' | 'pointer'
export type HarmonyMode = 'complementary' | 'analogous' | 'triadic' | 'split' | 'tetradic' | 'square'

export interface ColorPickerState {
  color: ColorInfo | null
  cursorPos: { x: number; y: number } | null
  history: ColorInfo[]
  copiedLabel: string | null
}
