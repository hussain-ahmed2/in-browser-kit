'use client'

import { Crosshair, CircleDot, MousePointer2, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CursorMode } from '../types'

const CURSOR_ICONS: Record<CursorMode, typeof Crosshair> = {
  crosshair: Crosshair,
  magnifier: CircleDot,
  pointer: MousePointer2,
}

const CURSOR_LABELS: Record<CursorMode, string> = {
  crosshair: 'Crosshair',
  magnifier: 'Magnifier',
  pointer: 'Pointer',
}

interface CursorToolbarProps {
  cursorMode: CursorMode
  onCursorModeChange: (mode: CursorMode) => void
  magnifierZoom: number
  onMagnifierZoomChange: (updater: (z: number) => number) => void
}

export function CursorToolbar({
  cursorMode,
  onCursorModeChange,
  magnifierZoom,
  onMagnifierZoomChange,
}: CursorToolbarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground mr-1">Cursor:</span>
      {(Object.keys(CURSOR_ICONS) as CursorMode[]).map((mode) => {
        const Icon = CURSOR_ICONS[mode]
        return (
          <Button
            key={mode}
            variant={cursorMode === mode ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCursorModeChange(mode)}
          >
            <Icon />
            {CURSOR_LABELS[mode]}
          </Button>
        )
      })}
      {cursorMode === 'magnifier' && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMagnifierZoomChange((z) => Math.max(2, z - 2))}
          >
            <Minus />
          </Button>
          <span className="text-xs text-muted-foreground w-8 text-center">
            {magnifierZoom}x
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMagnifierZoomChange((z) => Math.min(16, z + 2))}
          >
            <Plus />
          </Button>
        </div>
      )}
    </div>
  )
}
