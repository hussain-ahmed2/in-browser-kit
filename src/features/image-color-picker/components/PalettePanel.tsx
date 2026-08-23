'use client'

import { Trash2, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaletteColor } from '../lib/colorExport'

interface PalettePanelProps {
  palette: PaletteColor[]
  onRemove: (hex: string) => void
  onClear: () => void
}

export function PalettePanel({ palette, onRemove, onClear }: PalettePanelProps) {
  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Palette ({palette.length})
        </span>
        {palette.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            <Trash2 />
            Clear
          </Button>
        )}
      </div>
      {palette.length > 0 ? (
        <div className="flex gap-2 flex-wrap">
          {palette.map((pc) => (
            <div key={pc.hex} className="group/pc relative">
              <div
                className="w-10 h-10 rounded-lg border border-border shadow-sm"
                style={{ backgroundColor: pc.hex }}
              />
              <button
                type="button"
                className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover/pc:opacity-100 transition-opacity"
                onClick={() => onRemove(pc.hex)}
              >
                <Minus className="size-2" />
              </button>
              <p className="text-[9px] text-muted-foreground text-center mt-0.5 font-mono">
                {pc.hex}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Click harmony colors or extracted colors to add
        </p>
      )}
    </div>
  )
}
