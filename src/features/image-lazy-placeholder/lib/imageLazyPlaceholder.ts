export interface PlaceholderResult {
  file: File
  objectUrl: string
  width: number
  height: number
  base64: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

export async function createPlaceholder(
  file: File,
  options: { targetWidth: number; format: 'webp' | 'png' | 'jpeg'; quality: number }
): Promise<PlaceholderResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const aspectRatio = img.naturalHeight / img.naturalWidth
  const targetHeight = Math.max(1, Math.round(options.targetWidth * aspectRatio))

  const canvas = document.createElement('canvas')
  canvas.width = options.targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!

  // Draw tiny (pixelated)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(img, 0, 0, options.targetWidth, targetHeight)

  const mimeType = options.format === 'webp' ? 'image/webp' : options.format === 'png' ? 'image/png' : 'image/jpeg'
  const quality = options.format === 'png' ? undefined : options.quality

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, mimeType, quality)
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  // Read back the tiny image to create the blur effect
  const tinyCanvas = document.createElement('canvas')
  tinyCanvas.width = options.targetWidth
  tinyCanvas.height = targetHeight
  const tinyCtx = tinyCanvas.getContext('2d')!
  tinyCtx.filter = 'blur(2px)'
  tinyCtx.drawImage(canvas, 0, 0)

  const blurredBlob = await new Promise<Blob | null>((resolve) =>
    tinyCanvas.toBlob(resolve, mimeType, quality)
  )
  if (!blurredBlob) throw new Error('Canvas toBlob returned null')

  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(blurredBlob)
  })

  const resultFile = new File([blurredBlob], file.name, { type: mimeType, lastModified: Date.now() })
  return {
    file: resultFile,
    objectUrl: URL.createObjectURL(resultFile),
    width: options.targetWidth,
    height: targetHeight,
    base64,
  }
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
