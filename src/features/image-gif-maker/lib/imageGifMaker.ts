import GIF from 'gif.js'

export interface GifMakerOptions {
  frames: File[]
  frameDelay: number
  loopCount: number
  width?: number
  height?: number
  backgroundColor: string
}

export interface GifMakerResult {
  file: File
  objectUrl: string
  width: number
  height: number
  frameCount: number
  totalDuration: number
}

export async function createGif(options: GifMakerOptions): Promise<GifMakerResult> {
  const { frames, frameDelay, loopCount, width, height, backgroundColor } = options

  if (frames.length === 0) {
    throw new Error('No frames provided')
  }

  // Load all images first
  const images = await Promise.all(
    frames.map((file) => loadImage(file))
  )

  // Determine canvas size
  const canvasWidth = width || images[0].width
  const canvasHeight = height || images[0].height

  // Create GIF encoder
  const gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvasWidth,
    height: canvasHeight,
    workerScript: '/gif.worker.js',
    background: backgroundColor,
  })

  // Add frames
  for (const img of images) {
    const canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    const ctx = canvas.getContext('2d')!
    
    // Fill background
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    // Draw image centered
    const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height)
    const drawWidth = img.width * scale
    const drawHeight = img.height * scale
    const x = (canvasWidth - drawWidth) / 2
    const y = (canvasHeight - drawHeight) / 2
    
    ctx.drawImage(img, x, y, drawWidth, drawHeight)
    gif.addFrame(ctx, { delay: frameDelay, copy: true })
  }

  // Set loop count
  gif.on('finished', (blob: Blob) => {
    const resultFile = new File([blob], 'animation.gif', {
      type: 'image/gif',
      lastModified: Date.now(),
    })
    const objectUrl = URL.createObjectURL(resultFile)
    
    return {
      file: resultFile,
      objectUrl,
      width: canvasWidth,
      height: canvasHeight,
      frameCount: images.length,
      totalDuration: images.length * frameDelay,
    }
  })

  gif.render()

  // Wait for rendering to complete
  return new Promise((resolve, reject) => {
    gif.on('finished', (blob: Blob) => {
      const resultFile = new File([blob], 'animation.gif', {
        type: 'image/gif',
        lastModified: Date.now(),
      })
      const objectUrl = URL.createObjectURL(resultFile)
      resolve({
        file: resultFile,
        objectUrl,
        width: canvasWidth,
        height: canvasHeight,
        frameCount: images.length,
        totalDuration: images.length * frameDelay,
      })
    })
    gif.on('error', reject)
  })
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(img.src)
      resolve(img)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}