export interface HeicConverterResult {
  file: File
  objectUrl: string
  width: number
  height: number
}

export const SUPPORTED_OUTPUT_FORMATS: {
  value: 'image/jpeg' | 'image/png'
  label: string
  extension: string
}[] = [
  { value: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
  { value: 'image/png', label: 'PNG', extension: 'png' },
]

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export async function convertHeic(
  file: File,
  outputFormat: 'image/jpeg' | 'image/png',
  quality: number
): Promise<HeicConverterResult> {
  const heic2any = (await import('heic2any')).default

  const blob = await heic2any({
    blob: file,
    toType: outputFormat,
    quality,
  })

  const resultBlob = Array.isArray(blob) ? blob[0] : blob

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ext =
        SUPPORTED_OUTPUT_FORMATS.find((f) => f.value === outputFormat)
          ?.extension || 'jpg'
      const baseName = file.name.replace(/\.[^/.]+$/, '')
      const resultFile = new File([resultBlob], `${baseName}.${ext}`, {
        type: outputFormat,
        lastModified: Date.now(),
      })
      const objectUrl = URL.createObjectURL(resultFile)
      resolve({
        file: resultFile,
        objectUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load converted image'))
    img.src = URL.createObjectURL(resultBlob)
  })
}
