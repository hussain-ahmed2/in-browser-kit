export interface BorderOptions {
  borderWidth: number
  borderColor: string
  borderRadius: number
  style: 'solid' | 'double' | 'dashed' | 'dotted'
}

export interface BorderResult {
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

export async function applyBorder(
  file: File,
  options: BorderOptions
): Promise<BorderResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const bw = options.borderWidth
  const canvasW = img.naturalWidth + bw * 2
  const canvasH = img.naturalHeight + bw * 2

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  // Draw background for double style
  if (options.style === 'double') {
    ctx.fillStyle = options.borderColor
    if (options.borderRadius > 0) {
      drawRoundedRect(ctx, 0, 0, canvasW, canvasH, options.borderRadius)
      ctx.fill()
    } else {
      ctx.fillRect(0, 0, canvasW, canvasH)
    }
    // Inner clear
    const innerBw = Math.max(1, Math.floor(bw / 3))
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    if (options.borderRadius > 0) {
      drawRoundedRect(ctx, innerBw, innerBw, canvasW - innerBw * 2, canvasH - innerBw * 2, Math.max(0, options.borderRadius - innerBw))
      ctx.fill()
    } else {
      ctx.fillRect(innerBw, innerBw, canvasW - innerBw * 2, canvasH - innerBw * 2)
    }
    ctx.restore()

    // Draw inner border line
    const innerOffset = Math.floor(bw / 3) * 2
    ctx.strokeStyle = options.borderColor
    ctx.lineWidth = Math.max(1, Math.floor(bw / 3))
    if (options.borderRadius > 0) {
      drawRoundedRect(ctx, innerOffset, innerOffset, canvasW - innerOffset * 2, canvasH - innerOffset * 2, Math.max(0, options.borderRadius - innerOffset))
      ctx.stroke()
    } else {
      ctx.strokeRect(innerOffset, innerOffset, canvasW - innerOffset * 2, canvasH - innerOffset * 2)
    }
  } else {
    // Solid, dashed, dotted
    ctx.strokeStyle = options.borderColor
    ctx.lineWidth = bw

    if (options.style === 'dashed') {
      ctx.setLineDash([bw * 2, bw])
    } else if (options.style === 'dotted') {
      ctx.setLineDash([bw, bw])
    } else {
      ctx.setLineDash([])
    }

    if (options.borderRadius > 0) {
      drawRoundedRect(ctx, bw / 2, bw / 2, canvasW - bw, canvasH - bw, options.borderRadius)
      ctx.stroke()
    } else {
      ctx.strokeRect(bw / 2, bw / 2, canvasW - bw, canvasH - bw)
    }
    ctx.setLineDash([])
  }

  // Draw image
  if (options.borderRadius > 0 && options.style !== 'double') {
    ctx.save()
    drawRoundedClip(ctx, bw, bw, img.naturalWidth, img.naturalHeight, options.borderRadius)
    ctx.drawImage(img, bw, bw)
    ctx.restore()
  } else {
    ctx.drawImage(img, bw, bw)
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, {
    type: blob.type || file.type,
    lastModified: Date.now(),
  })
  const objectUrl = URL.createObjectURL(resultFile)

  return { file: resultFile, objectUrl, width: canvasW, height: canvasH }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}

function drawRoundedClip(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  drawRoundedRect(ctx, x, y, w, h, r)
  ctx.clip()
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
