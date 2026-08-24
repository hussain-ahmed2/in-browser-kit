import { parseGIF, decompressFrames } from 'gifuct-js'
import GifEncoder from 'gif.js'

export interface OptimizeOptions {
  maxColors: number
  removeDuplicates: boolean
  lossyLevel: number
  optimizeFrames: boolean
}

export interface OptimizeResult {
  file: File
  objectUrl: string
  originalSize: number
  optimizedSize: number
  savings: number
  width: number
  height: number
  frameCount: number
  originalFrameCount: number
}

export async function optimizeGif(
  file: File,
  options: OptimizeOptions
): Promise<OptimizeResult> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const originalSize = file.size

  // Parse original GIF
  const gif = parseGIF(uint8Array)
  const frames = decompressFrames(gif, true)
  const width = gif.lsd?.width || 0
  const height = gif.lsd?.height || 0

  // Remove duplicate frames if enabled
  const framesToProcess = options.removeDuplicates ? removeDuplicateFrames(frames) : frames

  // Map lossyLevel (0-100) to gif.js quality (1=best, 30=default, 100=worst)
  const quality = Math.max(1, Math.min(100, Math.round(options.lossyLevel)))

  // Create optimized GIF encoder
  const encoder = new GifEncoder({
    workers: 2,
    quality,
    width,
    height,
    workerScript: '/gif.worker.js',
  })

  // Composite each frame onto a full-size canvas and add to encoder
  for (const frame of framesToProcess) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!

    if (frame.patch) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = frame.dims.width
      tempCanvas.height = frame.dims.height
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.putImageData(
        new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height),
        0,
        0
      )
      ctx.drawImage(tempCanvas, frame.dims.left, frame.dims.top)
    }

    encoder.addFrame(ctx, {
      delay: frame.delay || 100,
      copy: true,
    })
  }

  // Generate optimized GIF
  return new Promise((resolve, reject) => {
    encoder.on('finished', (blob: Blob) => {
      const resultFile = new File([blob], 'optimized.gif', {
        type: 'image/gif',
        lastModified: Date.now(),
      })
      const objectUrl = URL.createObjectURL(resultFile)
      const optimizedSize = blob.size
      const savings = parseFloat(((1 - optimizedSize / originalSize) * 100).toFixed(1))

      resolve({
        file: resultFile,
        objectUrl,
        originalSize,
        optimizedSize,
        savings,
        width,
        height,
        frameCount: framesToProcess.length,
        originalFrameCount: frames.length,
      })
    })

    encoder.on('error', reject)
    encoder.render()
  })
}

function removeDuplicateFrames<T extends { patch?: Uint8ClampedArray }>(frames: T[]): T[] {
  if (frames.length <= 1) return frames

  const uniqueFrames = [frames[0]]
  let lastPatch = frames[0].patch

  for (let i = 1; i < frames.length; i++) {
    const frame = frames[i]
    if (frame.patch && lastPatch) {
      if (!arraysEqual(frame.patch, lastPatch)) {
        uniqueFrames.push(frame)
        lastPatch = frame.patch
      }
    } else {
      uniqueFrames.push(frame)
      lastPatch = frame.patch
    }
  }

  return uniqueFrames
}

function arraysEqual(a: Uint8ClampedArray, b: Uint8ClampedArray): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}
