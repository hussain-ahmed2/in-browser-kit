'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ExtractedColor } from '../lib/paletteExtractor'

interface ExtractedPaletteProps {
  colors: ExtractedColor[]
  onExtract: () => void
  onAddToPalette: (hex: string) => void
}

export function ExtractedPalette({
  colors,
  onExtract,
  onAddToPalette,
}: ExtractedPaletteProps) {
  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Dominant Colors</span>
        <Button variant="outline" size="sm" onClick={onExtract}>
          Extract
        </Button>
      </div>
      {colors.length > 0 ? (
        <div className="space-y-2">
          {colors.map((ec) => (
            <button
              key={ec.hex}
              type="button"
              className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-secondary transition-colors"
              onClick={() => onAddToPalette(ec.hex)}
            >
              <div
                className="w-6 h-6 rounded border border-border shrink-0"
                style={{ backgroundColor: ec.hex }}
              />
              <span className="text-xs font-mono flex-1 text-left">{ec.hex}</span>
              <span className="text-xs text-muted-foreground">{ec.percentage}%</span>
              <Plus className="size-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Click Extract to find dominant colors
        </p>
      )}
    </div>
  )
}
