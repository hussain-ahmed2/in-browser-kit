'use client'

import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewSectionProps {
  previewUrl: string
  dimensions: { width: number; height: number } | null
  onClear: () => void
}

export function PreviewSection({ previewUrl, dimensions, onClear }: PreviewSectionProps) {
  return (
    <div className="relative group">
      <div className="w-full rounded-lg border border-border max-h-96 object-contain overflow-hidden bg-[repeating-conic-gradient(#e5e5e5_0%_25%,transparent_0%_50%)] bg-50px">
        <Image
          src={previewUrl}
          alt="Preview"
          width={dimensions?.width || 400}
          height={dimensions?.height || 300}
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
      {dimensions && (
        <p className="text-sm text-muted-foreground text-center mt-2">
          {dimensions.width}×{dimensions.height}
        </p>
      )}
    </div>
  )
}
