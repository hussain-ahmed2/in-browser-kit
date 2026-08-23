'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRgb, formatHsl, type ColorInfo } from '../lib/imageColorPicker'

interface ColorHistoryProps {
  history: ColorInfo[]
  onClear: () => void
  onCopy: (label: string, value: string) => void
}

export function ColorHistory({ history, onClear, onCopy }: ColorHistoryProps) {
  if (history.length === 0) return null

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          History ({history.length})
        </span>
        <Button variant="outline" size="sm" onClick={onClear}>
          <Trash2 />
        </Button>
      </div>
      <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto">
        {history.map((hc, i) => (
          <DropdownMenu key={`${hc.hex}-${i}`}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="w-7 h-7 rounded border border-border hover:ring-2 ring-primary transition-all shrink-0"
                style={{ backgroundColor: hc.hex }}
                title={hc.hex}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onCopy('HEX', hc.hex)}>
                <span className="font-mono text-xs">{hc.hex}</span>
                <span className="text-muted-foreground ml-auto">HEX</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy('RGB', formatRgb(hc.rgb))}>
                <span className="font-mono text-xs">{formatRgb(hc.rgb)}</span>
                <span className="text-muted-foreground ml-auto">RGB</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCopy('HSL', formatHsl(hc.hsl))}>
                <span className="font-mono text-xs">{formatHsl(hc.hsl)}</span>
                <span className="text-muted-foreground ml-auto">HSL</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  )
}
