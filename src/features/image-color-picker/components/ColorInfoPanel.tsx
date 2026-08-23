'use client'

import { Copy, Check } from 'lucide-react'
import { formatRgb, formatHsl, type ColorInfo } from '../lib/imageColorPicker'

interface ColorInfoPanelProps {
  color: ColorInfo
  cursorPos: { x: number; y: number } | null
  copiedLabel: string | null
  onCopy: (label: string, value: string) => void
}

export function ColorInfoPanel({
  color,
  cursorPos,
  copiedLabel,
  onCopy,
}: ColorInfoPanelProps) {
  const items = [
    { label: 'HEX', value: color.hex },
    { label: 'RGB', value: formatRgb(color.rgb) },
    { label: 'HSL', value: formatHsl(color.hsl) },
  ]

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center gap-3">
        <div
          className="w-14 h-14 rounded-lg border-2 border-border shadow-inner shrink-0"
          style={{ backgroundColor: color.hex }}
        />
        <div className="flex-1 min-w-0">
          {cursorPos && (
            <p className="text-xs text-muted-foreground">
              ({cursorPos.x}, {cursorPos.y})
            </p>
          )}
          <p className="text-lg font-mono font-bold truncate">{color.hex}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {formatRgb(color.rgb)}
          </p>
          <p className="text-xs text-muted-foreground font-mono">
            {formatHsl(color.hsl)}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex items-center justify-between p-2 rounded-md bg-secondary/50 border border-border hover:bg-secondary transition-colors text-left"
            onClick={() => onCopy(item.label, item.value)}
          >
            <span className="text-xs font-mono truncate">{item.value}</span>
            {copiedLabel === item.label ? (
              <Check className="size-3 text-green-500 shrink-0" />
            ) : (
              <Copy className="size-3 text-muted-foreground shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
