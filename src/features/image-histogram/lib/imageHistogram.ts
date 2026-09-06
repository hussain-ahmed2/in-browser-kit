export interface HistogramData {
  r: number[]
  g: number[]
  b: number[]
  luminance: number[]
  totalPixels: number
}

export interface HistogramResult {
  histogram: HistogramData
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

export async function computeHistogram(file: File): Promise<HistogramResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const totalPixels = canvas.width * canvas.height

  const r = new Array(256).fill(0)
  const g = new Array(256).fill(0)
  const b = new Array(256).fill(0)
  const luminance = new Array(256).fill(0)

  for (let i = 0; i < data.length; i += 4) {
    const rv = data[i]
    const gv = data[i + 1]
    const bv = data[i + 2]

    r[rv]++
    g[gv]++
    b[bv]++

    // ITU-R BT.601 luminance
    const l = Math.round(0.299 * rv + 0.587 * gv + 0.114 * bv)
    luminance[l]++
  }

  return {
    histogram: { r, g, b, luminance, totalPixels },
    width: img.naturalWidth,
    height: img.naturalHeight,
  }
}

export function normalizeHistogram(bins: number[]): number[] {
  const max = Math.max(...bins)
  if (max === 0) return bins.map(() => 0)
  return bins.map((v) => v / max)
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
