export interface ProfilePicResult {
  file: File
  objectUrl: string
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

export async function createProfilePic(
  file: File,
  options: { shape: 'circle' | 'square'; size: number; borderWidth: number; borderColor: string }
): Promise<ProfilePicResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const size = options.size
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Center-crop to square
  const scale = Math.max(size / img.naturalWidth, size / img.naturalHeight)
  const drawW = img.naturalWidth * scale
  const drawH = img.naturalHeight * scale
  const dx = (size - drawW) / 2
  const dy = (size - drawH) / 2

  if (options.shape === 'circle') {
    ctx.save()
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, dx, dy, drawW, drawH)
    ctx.restore()

    if (options.borderWidth > 0) {
      ctx.strokeStyle = options.borderColor
      ctx.lineWidth = options.borderWidth * 2
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - options.borderWidth, 0, Math.PI * 2)
      ctx.stroke()
    }
  } else {
    ctx.drawImage(img, dx, dy, drawW, drawH)
    if (options.borderWidth > 0) {
      ctx.strokeStyle = options.borderColor
      ctx.lineWidth = options.borderWidth * 2
      ctx.strokeRect(options.borderWidth / 2, options.borderWidth / 2, size - options.borderWidth, size - options.borderWidth)
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png', 1)
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, { type: 'image/png', lastModified: Date.now() })
  return { file: resultFile, objectUrl: URL.createObjectURL(resultFile), width: size, height: size }
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
