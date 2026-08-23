'use client'

import { Download, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PaletteColor } from '../lib/colorExport'
import { toCssVars, toScssVars, toJson } from '../lib/colorExport'

interface ExportPanelProps {
  palette: PaletteColor[]
  exportFormat: 'css' | 'scss' | 'json'
  onExportFormatChange: (fmt: 'css' | 'scss' | 'json') => void
}

export function ExportPanel({
  palette,
  exportFormat,
  onExportFormatChange,
}: ExportPanelProps) {
  const handleExport = () => {
    let output: string
    if (exportFormat === 'css') output = toCssVars(palette)
    else if (exportFormat === 'scss') output = toScssVars(palette)
    else output = toJson(palette)
    navigator.clipboard.writeText(output)
  }

  if (palette.length === 0) return null

  return (
    <div className="p-4 rounded-lg bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center gap-2">
        <Download className="size-4" />
        <span className="text-sm font-medium">Export</span>
      </div>
      <div className="flex gap-2">
        {(['css', 'scss', 'json'] as const).map((fmt) => (
          <Button
            key={fmt}
            variant={exportFormat === fmt ? 'default' : 'outline'}
            size="sm"
            onClick={() => onExportFormatChange(fmt)}
          >
            {fmt.toUpperCase()}
          </Button>
        ))}
      </div>
      <Button className="w-full" onClick={handleExport}>
        <Copy />
        Copy {exportFormat.toUpperCase()} to Clipboard
      </Button>
    </div>
  )
}
