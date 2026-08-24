'use client'

import { useRef, useEffect } from 'react'
import type { CropArea } from '../lib/imageCrop'

interface CropPreviewProps {
  previewUrl: string | null
  cropArea: CropArea | null
}

export function CropPreview({ previewUrl, cropArea }: CropPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!cropArea || !previewUrl || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const maxW = 300
      const maxH = 300
      const scale = Math.min(maxW / cropArea.width, maxH / cropArea.height)
      canvas.width = cropArea.width * scale
      canvas.height = cropArea.height * scale
      ctx.drawImage(
        img,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        canvas.width,
        canvas.height
      )
    }
    img.src = previewUrl
  }, [cropArea, previewUrl])

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Live Preview</span>
        {cropArea && (
          <span className="text-xs text-muted-foreground font-mono">
            {Math.round(cropArea.width)}×{Math.round(cropArea.height)}
          </span>
        )}
      </div>
      <div className="relative w-full aspect-square bg-muted/50 rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        {!cropArea && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            Drag to create selection
          </div>
        )}
      </div>
    </div>
  )
}