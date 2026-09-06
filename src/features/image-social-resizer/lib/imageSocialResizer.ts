import type { SocialPreset } from '../types'

export interface SocialResizeResult {
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

export async function resizeForSocial(
  file: File,
  preset: SocialPreset,
  fit: 'cover' | 'contain' | 'stretch' = 'cover'
): Promise<SocialResizeResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = preset.width
  canvas.height = preset.height
  const ctx = canvas.getContext('2d')!

  if (fit === 'stretch') {
    ctx.drawImage(img, 0, 0, preset.width, preset.height)
  } else if (fit === 'contain') {
    const scale = Math.min(preset.width / img.naturalWidth, preset.height / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, preset.width, preset.height)
    ctx.drawImage(img, (preset.width - w) / 2, (preset.height - h) / 2, w, h)
  } else {
    // cover — center-crop
    const scale = Math.max(preset.width / img.naturalWidth, preset.height / img.naturalHeight)
    const w = img.naturalWidth * scale
    const h = img.naturalHeight * scale
    ctx.drawImage(img, (preset.width - w) / 2, (preset.height - h) / 2, w, h)
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() })
  return { file: resultFile, objectUrl: URL.createObjectURL(resultFile), width: preset.width, height: preset.height }
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
