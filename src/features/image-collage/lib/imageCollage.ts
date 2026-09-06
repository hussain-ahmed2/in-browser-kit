import type { CollageLayout } from '../types'

export interface CollageResult {
  file: File
  objectUrl: string
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(src)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(src)
      reject(new Error('Failed to load image'))
    }
    img.src = src
  })
}

function getLayoutGrid(layout: CollageLayout, count: number): { cols: number; rows: number } {
  switch (layout) {
    case 'grid-2x2': return { cols: 2, rows: 2 }
    case 'grid-3x3': return { cols: 3, rows: 3 }
    case 'horizontal': return { cols: count, rows: 1 }
    case 'vertical': return { cols: 1, rows: count }
    case 'mosaic': {
      if (count <= 2) return { cols: 2, rows: 1 }
      if (count <= 4) return { cols: 2, rows: 2 }
      if (count <= 6) return { cols: 3, rows: 2 }
      return { cols: 3, rows: 3 }
    }
  }
}

export async function createCollage(
  files: File[],
  layout: CollageLayout,
  options: { gap: number; padding: number; backgroundColor: string }
): Promise<CollageResult> {
  if (files.length === 0) throw new Error('No images provided')

  const images = await Promise.all(files.map((f) => loadImage(URL.createObjectURL(f))))

  const { cols, rows } = getLayoutGrid(layout, images.length)

  // Compute cell size as the average image dimension
  const avgW = images.reduce((s, img) => s + img.naturalWidth, 0) / images.length
  const avgH = images.reduce((s, img) => s + img.naturalHeight, 0) / images.length

  const cellW = Math.round(avgW)
  const cellH = Math.round(avgH)

  const canvasW = options.padding * 2 + cols * cellW + (cols - 1) * options.gap
  const canvasH = options.padding * 2 + rows * cellH + (rows - 1) * options.gap

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = options.backgroundColor
  ctx.fillRect(0, 0, canvasW, canvasH)

  // Draw images into cells
  for (let i = 0; i < images.length && i < cols * rows; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)

    const x = options.padding + col * (cellW + options.gap)
    const y = options.padding + row * (cellH + options.gap)

    const img = images[i]
    const scale = Math.min(cellW / img.naturalWidth, cellH / img.naturalHeight)
    const drawW = img.naturalWidth * scale
    const drawH = img.naturalHeight * scale
    const drawX = x + (cellW - drawW) / 2
    const drawY = y + (cellH - drawH) / 2

    ctx.drawImage(img, drawX, drawY, drawW, drawH)
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], 'collage.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
  const objectUrl = URL.createObjectURL(resultFile)

  return { file: resultFile, objectUrl, width: canvasW, height: canvasH }
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)
  return { width: img.naturalWidth, height: img.naturalHeight }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
