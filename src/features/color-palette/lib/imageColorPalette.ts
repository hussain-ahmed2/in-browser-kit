export interface PaletteColor {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  percentage: number
}

export interface ColorPalette {
  colors: PaletteColor[]
  width: number
  height: number
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
  )
}

export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6
      break
    case g:
      h = ((b - r) / d + 2) / 6
      break
    case b:
      h = ((r - g) / d + 4) / 6
      break
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Median-cut algorithm to extract dominant colors from image pixel data.
 */
function medianCut(
  pixels: [number, number, number][],
  depth: number
): [number, number, number][][] {
  if (depth === 0 || pixels.length === 0) {
    return [pixels]
  }

  // Find the channel with the largest range
  let rMin = Infinity,
    rMax = -Infinity
  let gMin = Infinity,
    gMax = -Infinity
  let bMin = Infinity,
    bMax = -Infinity

  for (const [r, g, b] of pixels) {
    if (r < rMin) rMin = r
    if (r > rMax) rMax = r
    if (g < gMin) gMin = g
    if (g > gMax) gMax = g
    if (b < bMin) bMin = b
    if (b > bMax) bMax = b
  }

  const rRange = rMax - rMin
  const gRange = gMax - gMin
  const bRange = bMax - bMin

  let channel: number
  if (rRange >= gRange && rRange >= bRange) {
    channel = 0
  } else if (gRange >= rRange && gRange >= bRange) {
    channel = 1
  } else {
    channel = 2
  }

  pixels.sort((a, b) => a[channel] - b[channel])

  const mid = Math.floor(pixels.length / 2)
  const left = pixels.slice(0, mid)
  const right = pixels.slice(mid)

  return [...medianCut(left, depth - 1), ...medianCut(right, depth - 1)]
}

function averageColor(
  pixels: [number, number, number][]
): [number, number, number] {
  if (pixels.length === 0) return [0, 0, 0]
  let rSum = 0,
    gSum = 0,
    bSum = 0
  for (const [r, g, b] of pixels) {
    rSum += r
    gSum += g
    bSum += b
  }
  const n = pixels.length
  return [Math.round(rSum / n), Math.round(gSum / n), Math.round(bSum / n)]
}

/**
 * Extract a color palette from an image file using the median-cut algorithm.
 */
export async function extractPalette(
  file: File,
  colorCount: number
): Promise<ColorPalette> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const maxDim = 200
      const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
      canvas.width = Math.round(img.naturalWidth * scale)
      canvas.height = Math.round(img.naturalHeight * scale)
      const ctx = canvas.getContext('2d')!

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const pixels: [number, number, number][] = []
      for (let i = 0; i < data.length; i += 4) {
        // Skip mostly transparent pixels
        if (data[i + 3] < 128) continue
        pixels.push([data[i], data[i + 1], data[i + 2]])
      }

      if (pixels.length === 0) {
        reject(new Error('No valid pixels found in image'))
        return
      }

      const depth = Math.ceil(Math.log2(colorCount))
      const buckets = medianCut(pixels, depth)

      // Take the top buckets by pixel count, limited to colorCount
      const sorted = buckets
        .filter((b) => b.length > 0)
        .sort((a, b) => b.length - a.length)
        .slice(0, colorCount)

      const totalPixels = pixels.length
      const colors: PaletteColor[] = sorted.map((bucket) => {
        const [r, g, b] = averageColor(bucket)
        return {
          hex: rgbToHex(r, g, b),
          rgb: { r, g, b },
          hsl: rgbToHsl(r, g, b),
          percentage: Math.round((bucket.length / totalPixels) * 10000) / 100,
        }
      })

      // Sort colors by luminance for a nice visual order
      colors.sort((a, b) => a.hsl.l - b.hsl.l)

      resolve({
        colors,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })

      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
