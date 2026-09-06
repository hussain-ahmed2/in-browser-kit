export interface DropShadowOptions {
  offsetX: number
  offsetY: number
  blur: number
  color: string
  opacity: number
  spread: number
}

export interface DropShadowResult {
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

function parseColor(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  }
}

export async function applyDropShadow(
  file: File,
  options: DropShadowOptions
): Promise<DropShadowResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const padX = Math.abs(options.offsetX) + options.blur + options.spread
  const padY = Math.abs(options.offsetY) + options.blur + options.spread
  const canvasW = img.naturalWidth + padX * 2
  const canvasH = img.naturalHeight + padY * 2

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  const { r, g, b } = parseColor(options.color)
  const alpha = options.opacity / 100

  // Draw shadow
  ctx.save()
  ctx.shadowOffsetX = options.offsetX
  ctx.shadowOffsetY = options.offsetY
  ctx.shadowBlur = options.blur
  ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`

  if (options.spread > 0) {
    // Draw spread as a filled rectangle behind the image
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 0
    ctx.shadowBlur = 0
    ctx.shadowColor = 'transparent'
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    const sx = padX - options.spread
    const sy = padY - options.spread
    ctx.fillRect(sx, sy, img.naturalWidth + options.spread * 2, img.naturalHeight + options.spread * 2)

    // Draw spread shadow with offset
    ctx.shadowOffsetX = options.offsetX
    ctx.shadowOffsetY = options.offsetY
    ctx.shadowBlur = options.blur
    ctx.fillRect(sx, sy, img.naturalWidth + options.spread * 2, img.naturalHeight + options.spread * 2)
  } else {
    // Draw shadow via the image alpha
    ctx.drawImage(img, padX, padY)
  }
  ctx.restore()

  // Draw the original image on top
  ctx.drawImage(img, padX, padY)

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
