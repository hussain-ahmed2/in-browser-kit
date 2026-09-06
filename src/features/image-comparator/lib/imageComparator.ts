export interface CompareResult {
  diffDataUrl: string
  diffPercentage: number
  pixelCount: number
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

function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}

export async function compareImages(
  fileA: File,
  fileB: File,
  mode: 'side-by-side' | 'overlay' | 'diff',
  options: { overlayOpacity?: number; diffThreshold?: number } = {}
): Promise<CompareResult> {
  const srcA = URL.createObjectURL(fileA)
  const srcB = URL.createObjectURL(fileB)

  const [imgA, imgB] = await Promise.all([loadImage(srcA), loadImage(srcB)])

  const width = Math.max(imgA.naturalWidth, imgB.naturalWidth)
  const height = Math.max(imgA.naturalHeight, imgA.naturalHeight)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  if (mode === 'side-by-side') {
    canvas.width = imgA.naturalWidth + imgB.naturalWidth
    canvas.height = Math.max(imgA.naturalHeight, imgB.naturalHeight)
    ctx.drawImage(imgA, 0, 0)
    ctx.drawImage(imgB, imgA.naturalWidth, 0)
  } else if (mode === 'overlay') {
    ctx.globalAlpha = 1
    ctx.drawImage(imgA, 0, 0)
    ctx.globalAlpha = (options.overlayOpacity ?? 50) / 100
    ctx.drawImage(imgB, 0, 0)
    ctx.globalAlpha = 1
  } else {
    // Diff mode
    const dataA = getImageData(imgA)
    const dataB = getImageData(imgB)

    const canvasB = document.createElement('canvas')
    canvasB.width = imgB.naturalWidth
    canvasB.height = imgB.naturalHeight
    const ctxB = canvasB.getContext('2d')!
    ctxB.drawImage(imgB, 0, 0)
    const resizedB = ctxB.getImageData(0, 0, width, height)

    const canvasA = document.createElement('canvas')
    canvasA.width = imgA.naturalWidth
    canvasA.height = imgA.naturalHeight
    const ctxA = canvasA.getContext('2d')!
    ctxA.drawImage(imgA, 0, 0)
    const resizedA = ctxA.getImageData(0, 0, width, height)

    const diffData = ctx.createImageData(width, height)
    const threshold = options.diffThreshold ?? 0
    let diffPixels = 0
    const totalPixels = width * height

    for (let i = 0; i < diffData.data.length; i += 4) {
      const r = Math.abs(resizedA.data[i] - resizedB.data[i])
      const g = Math.abs(resizedA.data[i + 1] - resizedB.data[i + 1])
      const b = Math.abs(resizedA.data[i + 2] - resizedB.data[i + 2])

      if (r > threshold || g > threshold || b > threshold) {
        diffData.data[i] = 255
        diffData.data[i + 1] = 0
        diffData.data[i + 2] = 0
        diffData.data[i + 3] = 255
        diffPixels++
      } else {
        diffData.data[i] = resizedA.data[i]
        diffData.data[i + 1] = resizedA.data[i + 1]
        diffData.data[i + 2] = resizedA.data[i + 2]
        diffData.data[i + 3] = 128
      }
    }

    ctx.putImageData(diffData, 0, 0)

    const diffDataUrl = canvas.toDataURL('image/png')
    return {
      diffDataUrl,
      diffPercentage: parseFloat(((diffPixels / totalPixels) * 100).toFixed(2)),
      pixelCount: diffPixels,
      width,
      height,
    }
  }

  const diffDataUrl = canvas.toDataURL('image/png')
  return {
    diffDataUrl,
    diffPercentage: 0,
    pixelCount: 0,
    width: canvas.width,
    height: canvas.height,
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
