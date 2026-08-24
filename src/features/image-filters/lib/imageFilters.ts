export interface FilterValues {
  brightness: number
  contrast: number
  saturation: number
  blur: number
  grayscale: number
  sepia: number
  hueRotate: number
  invert: number
}

export const DEFAULT_FILTERS: FilterValues = {
  brightness: 0,
  contrast: 0,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  invert: 0,
}

export function getFilterCSS(filters: FilterValues): string {
  const parts: string[] = []
  if (filters.brightness !== 0) parts.push(`brightness(${100 + filters.brightness}%)`)
  if (filters.contrast !== 0) parts.push(`contrast(${100 + filters.contrast}%)`)
  if (filters.saturation !== 100) parts.push(`saturate(${filters.saturation}%)`)
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`)
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`)
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`)
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`)
  if (filters.invert > 0) parts.push(`invert(${filters.invert}%)`)
  return parts.join(' ') || 'none'
}

export async function applyFilters(
  file: File,
  filters: FilterValues
): Promise<{ file: File; objectUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      ctx.filter = getFilterCSS(filters)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'))
          return
        }
        const resultFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() })
        const objectUrl = URL.createObjectURL(resultFile)
        resolve({
          file: resultFile,
          objectUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
        })
      }, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}