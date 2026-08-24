'use client'

import Image from 'next/image'
import { Download, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '../lib/imageGifOptimizer'
import type { OptimizeResult } from '../lib/imageGifOptimizer'

interface ResultSectionProps {
  result: OptimizeResult
  onDownload: () => void
  onClear: () => void
}

export function ResultSection({ result, onDownload, onClear }: ResultSectionProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="relative group">
        <div className="w-full rounded-lg border border-border max-h-96 object-contain overflow-hidden">
          <Image
            src={result.objectUrl}
            alt="Optimized GIF"
            width={result.width}
            height={result.height}
            className="w-full max-h-96 object-contain"
          />
        </div>
        <button
          className="absolute top-2 right-2 p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={onClear}
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">Original Size</p>
          <p className="font-medium">{formatBytes(result.originalSize)}</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">Optimized Size</p>
          <p className="font-medium">{formatBytes(result.optimizedSize)}</p>
        </div>
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-700 dark:text-green-400">Savings</p>
          <p className="font-medium text-green-700 dark:text-green-400">{result.savings}%</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <p className="text-xs text-muted-foreground">Frames</p>
          <p className="font-medium">{result.originalFrameCount} → {result.frameCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
          onClick={() => {
            const a = document.createElement('a')
            a.href = result.objectUrl
            a.download = result.file.name
            a.click()
          }}
        >
          Download Optimized GIF
        </button>
        <button
          className="flex-1 px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary"
          onClick={onClear}
        >
          Start Over
        </button>
      </div>
    </div>
  )
}