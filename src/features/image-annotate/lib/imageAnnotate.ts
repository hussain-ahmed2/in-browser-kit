import type { Annotation } from '../types'

export interface AnnotateResult {
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

export function renderAnnotations(
  ctx: CanvasRenderingContext2D,
  annotations: Annotation[]
) {
  for (const a of annotations) {
    ctx.save()
    ctx.strokeStyle = a.color
    ctx.fillStyle = a.color
    ctx.lineWidth = a.strokeWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    switch (a.type) {
      case 'arrow': {
        const dx = a.x2 - a.x
        const dy = a.y2 - a.y
        const angle = Math.atan2(dy, dx)
        const len = Math.sqrt(dx * dx + dy * dy)
        const headLen = Math.min(len * 0.3, 20)

        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(a.x2, a.y2)
        ctx.stroke()

        // Arrowhead
        ctx.beginPath()
        ctx.moveTo(a.x2, a.y2)
        ctx.lineTo(
          a.x2 - headLen * Math.cos(angle - Math.PI / 6),
          a.y2 - headLen * Math.sin(angle - Math.PI / 6)
        )
        ctx.moveTo(a.x2, a.y2)
        ctx.lineTo(
          a.x2 - headLen * Math.cos(angle + Math.PI / 6),
          a.y2 - headLen * Math.sin(angle + Math.PI / 6)
        )
        ctx.stroke()
        break
      }
      case 'rectangle':
        ctx.strokeRect(a.x, a.y, a.x2 - a.x, a.y2 - a.y)
        break
      case 'circle': {
        const cx = (a.x + a.x2) / 2
        const cy = (a.y + a.y2) / 2
        const rx = Math.abs(a.x2 - a.x) / 2
        const ry = Math.abs(a.y2 - a.y) / 2
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
        break
      }
      case 'line':
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(a.x2, a.y2)
        ctx.stroke()
        break
      case 'text':
        if (a.text) {
          ctx.font = `${a.fontSize ?? 24}px sans-serif`
          ctx.fillText(a.text, a.x, a.y)
        }
        break
      case 'freehand':
        if (a.points && a.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(a.points[0].x, a.points[0].y)
          for (let i = 1; i < a.points.length; i++) {
            ctx.lineTo(a.points[i].x, a.points[i].y)
          }
          ctx.stroke()
        }
        break
    }
    ctx.restore()
  }
}

export async function annotateImage(
  file: File,
  annotations: Annotation[]
): Promise<AnnotateResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0)
  renderAnnotations(ctx, annotations)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, {
    type: blob.type || file.type,
    lastModified: Date.now(),
  })
  const objectUrl = URL.createObjectURL(resultFile)

  return { file: resultFile, objectUrl, width: canvas.width, height: canvas.height }
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
