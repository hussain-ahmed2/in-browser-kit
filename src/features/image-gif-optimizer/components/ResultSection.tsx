'use client'

import Image from 'next/image'
import { ArrowRight, Download, RotateCcw, X } from 'lucide-react'
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
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-2 right-2"
          onClick={onClear}
          aria-label="Remove image"
        >
          <X />
        </Button>
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
          <p className="font-medium inline-flex items-center gap-1">
            {result.originalFrameCount}
            <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
            {result.frameCount}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onDownload} className="flex-1">
          <Download aria-hidden="true" />
          Download Optimized GIF
        </Button>
        <Button variant="outline" onClick={onClear} className="flex-1">
          <RotateCcw aria-hidden="true" />
          Start Over
        </Button>
      </div>
    </div>
  )
}
