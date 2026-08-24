export const PRESET_RATIOS = [
  { label: 'Free', value: 'free' as const, desc: 'Any ratio' },
  { label: 'Square', value: '1:1' as const, desc: 'Instagram post' },
  { label: '4:3', value: '4:3' as const, desc: 'Standard photo' },
  { label: '16:9', value: '16:9' as const, desc: 'Video/HD' },
  { label: '3:2', value: '3:2' as const, desc: 'DSLR' },
  { label: '9:16', value: '9:16' as const, desc: 'Story/Reel' },
  { label: '4:5', value: '4:5' as const, desc: 'Instagram portrait' },
  { label: '1:2', value: '1:2' as const, desc: 'Pinterest' },
] as const

export const GRID_OPTIONS = [
  { value: 'none' as const, label: 'None' },
  { value: 'thirds' as const, label: 'Rule of Thirds' },
  { value: 'golden' as const, label: 'Golden Ratio' },
  { value: 'center' as const, label: 'Center Crosshair' },
] as const

export const HANDLE_SIZE = 16
export const HANDLE_HIT = 10

export const cursorMap = {
  nw: 'nwse-resize', ne: 'nesw-resize',
  sw: 'nesw-resize', se: 'nwse-resize',
  n: 'ns-resize', s: 'ns-resize',
  w: 'ew-resize', e: 'ew-resize',
} as const

export const positions = ['nw', 'ne', 'sw', 'se', 'n', 's', 'w', 'e'] as const

export type GridType = 'none' | 'thirds' | 'golden' | 'center'
export type DragMode = 'none' | 'create' | 'move' | 'resize-nw' | 'resize-ne' | 'resize-sw' | 'resize-se' | 'resize-n' | 'resize-s' | 'resize-w' | 'resize-e'