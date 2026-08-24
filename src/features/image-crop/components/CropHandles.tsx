'use client'

import { HANDLE_SIZE, cursorMap, positions } from '../constants'

interface CropHandlesProps {
  cropArea: { x: number; y: number; width: number; height: number } | null
  dims: { width: number; height: number } | null
  onMouseDown: (pos: string, e: React.MouseEvent<HTMLDivElement>) => void
}

export function CropHandles({ cropArea, dims, onMouseDown }: CropHandlesProps) {
  if (!cropArea || !dims) return null

  return (
    <>
      {positions.map((pos) => {
        let left = 0, top = 0, borderRadius = '4px'
        if (pos.includes('n')) top = 0
        else if (pos.includes('s')) top = 100
        else top = 50
        if (pos.includes('w')) left = 0
        else if (pos.includes('e')) left = 100
        else left = 50
        if (pos.length === 1) borderRadius = '50%'

        return (
          <div
            key={pos}
            className="absolute border-2 border-white/90 bg-white/20 transition-opacity"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              transform: 'translate(-50%, -50%)',
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              borderRadius,
              cursor: cursorMap[pos],
            }}
            onMouseDown={(e) => onMouseDown(pos, e)}
          />
        )
      })}
    </>
  )
}