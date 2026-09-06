export interface OverlayOptions {
  opacity: number
  blendMode: string
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'
  scale: number
}

export interface OverlayResult {
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

function getPosition(
  position: OverlayOptions['position'],
  baseW: number, baseH: number,
  overW: number, overH: number,
): { x: number; y: number } {
  switch (position) {
    case 'top-left': return { x: 0, y: 0 }
    case 'top-right': return { x: baseW - overW, y: 0 }
    case 'bottom-left': return { x: 0, y: baseH - overH }
    case 'bottom-right': return { x: baseW - overW, y: baseH - overH }
    case 'center':
    default:
      return { x: (baseW - overW) / 2, y: (baseH - overH) / 2 }
  }
}

export async function overlayImages(
  baseFile: File,
  overlayFile: File,
  options: OverlayOptions
): Promise<OverlayResult> {
  const baseSrc = URL.createObjectURL(baseFile)
  const overSrc = URL.createObjectURL(overlayFile)

  const [baseImg, overImg] = await Promise.all([loadImage(baseSrc), loadImage(overSrc)])

  const canvas = document.createElement('canvas')
  canvas.width = baseImg.naturalWidth
  canvas.height = baseImg.naturalHeight
  const ctx = canvas.getContext('2d')!

  // Draw base
  ctx.drawImage(baseImg, 0, 0)

  // Apply overlay
  ctx.save()
  ctx.globalAlpha = options.opacity / 100
  ctx.globalCompositeOperation = options.blendMode as GlobalCompositeOperation

  const scale = options.scale / 100
  const overW = overImg.naturalWidth * scale
  const overH = overImg.naturalHeight * scale

  if (options.position === 'tile') {
    for (let x = 0; x < canvas.width; x += overW) {
      for (let y = 0; y < canvas.height; y += overH) {
        ctx.drawImage(overImg, x, y, overW, overH)
      }
    }
  } else {
    const pos = getPosition(options.position, canvas.width, canvas.height, overW, overH)
    ctx.drawImage(overImg, pos.x, pos.y, overW, overH)
  }
  ctx.restore()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, baseFile.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], baseFile.name, {
    type: blob.type || baseFile.type,
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
