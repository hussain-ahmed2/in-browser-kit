'use client'

import Image from 'next/image'
import { Download, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '../lib/imageGifOptimizer'
import type { OptimizeResult } from '../lib/imageGifOptimizer'

interface PreviewSectionProps {
  previewUrl: string
  dimensions: { width: number; height: number } | null
  onClear: () => void
}

export function PreviewSection({ previewUrl, dimensions, onClear }: PreviewSectionProps) {
  return (
    <div className="relative group">
      <div className="w-full rounded-lg border border-border max-h-96 object-contain overflow-hidden">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full max-h-96 object-contain"
        />
      </div>
      <button
        className="absolute top-2 right-2 p-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
        onClick={onClear}
      >
        ×
      </button>
      {dimensions && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          {dimensions.width}×{dimensions.height}
        </p>
      )}
    </div>
  )
}