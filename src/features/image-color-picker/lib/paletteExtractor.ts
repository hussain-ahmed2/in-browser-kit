export interface ExtractedColor {
  hex: string
  count: number
  percentage: number
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2
}

function initCentroids(pixels: { r: number; g: number; b: number }[], k: number): { r: number; g: number; b: number }[] {
  const centroids: { r: number; g: number; b: number }[] = []

  centroids.push(pixels[Math.floor(Math.random() * pixels.length)])

  for (let i = 1; i < k; i++) {
    let maxDist = -1
    let best = pixels[0]
    for (const pixel of pixels) {
      let minDist = Infinity
      for (const c of centroids) {
        const d = colorDistance(pixel.r, pixel.g, pixel.b, c.r, c.g, c.b)
        if (d < minDist) minDist = d
      }
      if (minDist > maxDist) {
        maxDist = minDist
        best = pixel
      }
    }
    centroids.push({ ...best })
  }

  return centroids
}

export function extractPalette(
  imageData: ImageData,
  numColors: number = 8,
  sampleStep: number = 3
): ExtractedColor[] {
  const { data, width, height } = imageData

  const pixels: { r: number; g: number; b: number }[] = []
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const idx = (y * width + x) * 4
      const a = data[idx + 3]
      if (a < 128) continue
      pixels.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] })
    }
  }

  if (pixels.length === 0) return []

  if (pixels.length <= numColors) {
    const total = pixels.length
    const counts = new Map<string, { r: number; g: number; b: number; count: number }>()
    for (const p of pixels) {
      const key = (p.r << 16) | (p.g << 8) | p.b
      const existing = counts.get(String(key))
      if (existing) {
        existing.count++
      } else {
        counts.set(String(key), { r: p.r, g: p.g, b: p.b, count: 1 })
      }
    }
    return Array.from(counts.values()).map((c) => ({
      hex: rgbToHex(c.r, c.g, c.b),
      count: c.count,
      percentage: Math.round((c.count / total) * 100),
    }))
  }

  const centroids = initCentroids(pixels, numColors)
  const assignments = new Int32Array(pixels.length)

  for (let iter = 0; iter < 15; iter++) {
    for (let i = 0; i < pixels.length; i++) {
      const p = pixels[i]
      let minDist = Infinity
      let best = 0
      for (let c = 0; c < centroids.length; c++) {
        const d = colorDistance(p.r, p.g, p.b, centroids[c].r, centroids[c].g, centroids[c].b)
        if (d < minDist) {
          minDist = d
          best = c
        }
      }
      assignments[i] = best
    }

    const sums = Array.from({ length: numColors }, () => ({ r: 0, g: 0, b: 0, count: 0 }))
    for (let i = 0; i < pixels.length; i++) {
      const c = assignments[i]
      const p = pixels[i]
      sums[c].r += p.r
      sums[c].g += p.g
      sums[c].b += p.b
      sums[c].count++
    }

    for (let c = 0; c < numColors; c++) {
      if (sums[c].count === 0) continue
      centroids[c] = {
        r: Math.round(sums[c].r / sums[c].count),
        g: Math.round(sums[c].g / sums[c].count),
        b: Math.round(sums[c].b / sums[c].count),
      }
    }
  }

  const finalCounts = Array.from({ length: numColors }, () => 0)
  for (let i = 0; i < pixels.length; i++) {
    finalCounts[assignments[i]]++
  }

  const total = pixels.length
  const results: ExtractedColor[] = []
  for (let c = 0; c < numColors; c++) {
    if (finalCounts[c] === 0) continue
    results.push({
      hex: rgbToHex(centroids[c].r, centroids[c].g, centroids[c].b),
      count: finalCounts[c],
      percentage: Math.round((finalCounts[c] / total) * 100),
    })
  }

  return results.sort((a, b) => b.count - a.count)
}
