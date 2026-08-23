'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getComplementary,
  getAnalogous,
  getTriadic,
  getSplitComplementary,
  getTetradic,
  getSquare,
} from '../lib/colorHarmony'
import type { HarmonyMode } from '../types'

const HARMONY_FNS: Record<HarmonyMode, (hex: string) => { hex: string; label: string }[]> = {
  complementary: getComplementary,
  analogous: getAnalogous,
  triadic: getTriadic,
  split: getSplitComplementary,
  tetradic: getTetradic,
  square: getSquare,
}

const HARMONY_LABELS: Record<HarmonyMode, string> = {
  complementary: 'Complementary',
  analogous: 'Analogous',
  triadic: 'Triadic',
  split: 'Split-Comp',
  tetradic: 'Tetradic',
  square: 'Square',
}

interface ColorHarmonyProps {
  hex: string
  harmonyMode: HarmonyMode
  onHarmonyModeChange: (mode: HarmonyMode) => void
  onAddToPalette: (hex: string) => void
}

export function ColorHarmony({
  hex,
  harmonyMode,
  onHarmonyModeChange,
  onAddToPalette,
}: ColorHarmonyProps) {
  const colors = HARMONY_FNS[harmonyMode](hex)

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4" />
        <span className="text-sm font-medium">Color Harmony</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {(Object.keys(HARMONY_LABELS) as HarmonyMode[]).map((mode) => (
          <Button
            key={mode}
            variant={harmonyMode === mode ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => onHarmonyModeChange(mode)}
          >
            {HARMONY_LABELS[mode]}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        {colors.map((hc) => (
          <button
            key={hc.hex}
            type="button"
            className="flex-1 group/hex"
            title={`${hc.label}: ${hc.hex}`}
            onClick={() => onAddToPalette(hc.hex)}
          >
            <div
              className="w-full h-8 rounded-md border border-border group-hover/hex:ring-2 ring-primary transition-all"
              style={{ backgroundColor: hc.hex }}
            />
            <p className="text-[10px] text-muted-foreground mt-1 truncate">
              {hc.hex}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
