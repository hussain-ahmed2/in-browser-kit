import * as Exifr from 'exifr'

export interface ExifSummary {
  make?: string
  model?: string
  software?: string
  dateTime?: string
  gps?: { latitude?: number; longitude?: number }
  lensModel?: string
  iso?: number
  exposureTime?: string
  fNumber?: string
  hasData: boolean
}

export interface ExifStripResult {
  file: File
  objectUrl: string
  originalSize: number
  strippedSize: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

export async function getExifSummary(file: File): Promise<ExifSummary> {
  try {
    const tags = await Exifr.parse(file, true)
    if (!tags) return { hasData: false }

    return {
      make: tags.Make,
      model: tags.Model,
      software: tags.Software,
      dateTime: tags.DateTimeOriginal || tags.DateTime,
      gps: tags.GPSLatitude ? { latitude: tags.GPSLatitude, longitude: tags.GPSLongitude } : undefined,
      lensModel: tags.LensModel,
      iso: tags.ISO,
      exposureTime: tags.ExposureTime ? `1/${Math.round(1 / tags.ExposureTime)}s` : undefined,
      fNumber: tags.FNumber ? `f/${tags.FNumber}` : undefined,
      hasData: true,
    }
  } catch {
    return { hasData: false }
  }
}

export async function stripExif(file: File): Promise<ExifStripResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() })
  return {
    file: resultFile,
    objectUrl: URL.createObjectURL(resultFile),
    originalSize: file.size,
    strippedSize: resultFile.size,
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
