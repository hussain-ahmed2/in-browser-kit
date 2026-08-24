import { parseGIF, decompressFrames, type GIFFrame, type GIF as GifuctGIF } from 'gifuct-js'
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

  // Remove duplicate frames if enabled
  const processedFrames = options.removeDuplicates ? removeDuplicateFrames(frames) : frames

  // Create optimized GIF
  const encoder = new GifEncoder({
    workers: 2,
    quality: 10,
    width: gif.lsd?.width || 0,
    height: gif.lsd?.height || 0,
    workerScript: '/gif.worker.js',
  })

  // Add optimized frames
  for (const frame of frames) {
    const canvas = document.createElement('canvas')
    canvas.width = gif.lsd?.width || 0
    canvas.height = gif.lsd?.height || 0
    const ctx = canvas.getContext('2d')!

    // Draw frame
    if (frame.patch) {
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = frame.dims?.width || 0
      tempCanvas.height = frame.dims?.height || 0
      const tempCtx = tempCanvas.getContext('2d')!
      tempCtx.putImageData(
        new ImageData(new Uint8ClampedArray(frame.patch), frame.dims?.width || 0, frame.dims?.height || 0),
        0, 0
      )
      
      // Draw background if first frame
      if (frame.index === 0) {
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, gif.lsd?.width || 0, gif.lsd?.height || 0)
      }

      // Draw frame at correct position
      ctx.drawImage(
        tempCanvas,
        frame.dims?.left || 0,
        frame.dims?.top || 0,
        frame.dims?.width || 0,
        frame.dims?.height || 0
      )
    }

    encoder.addFrame(ctx, {
      delay: frame.delay || 100,
      disposal: frame.disposalType || 0,
      copy: true,
    })
  }

  // Generate optimized GIF
  return new Promise((resolve, reject) => {
    const encoder = new GifEncoder({
      workers: 2,
      quality: 10,
      width: gif.lsd?.width || 0,
      height: gif.lsd?.height || 0,
      workerScript: '/gif.worker.js',
    })

    // Re-add frames
    for (const frame of frames) {
      const canvas = document.createElement('canvas')
      canvas.width = gif.lsd?.width || 0
      canvas.height = gif.lsd?.height || 0
      const ctx = canvas.getContext('2d')!

      if (frame.patch) {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = frame.dims?.width || 0
        tempCanvas.height = frame.dims?.height || 0
        const tempCtx = tempCanvas.getContext('2d')!
        tempCtx.putImageData(
          new ImageData(new Uint8ClampedArray(frame.patch), frame.dims?.width || 0, frame.dims?.height || 0),
          0, 0
        )
        ctx.drawImage(
          tempCanvas,
          frame.dims?.left || 0,
          frame.dims?.top || 0,
          frame.dims?.width || 0,
          frame.dims?.height || 0
        )
      }

      encoder.addFrame(ctx, {
        delay: frame.delay || 100,
        disposal: frame.disposalType || 0,
        copy: true,
      })
    }

    encoder.on('finished', (blob: Blob) => {
      const resultFile = new File([blob], 'optimized.gif', {
        type: 'image/gif',
        lastModified: Date.now(),
      })
      const objectUrl = URL.createObjectURL(resultFile)
      const optimizedSize = blob.size
      const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1)

      resolve({
        file: resultFile,
        objectUrl,
        originalSize,
        optimizedSize: blob.size,
        savings: parseFloat(savings),
        width: gif.lsd?.width || 0,
        height: gif.lsd?.height || 0,
        frameCount: frames.length,
        originalFrameCount: frames.length,
      })
    })

    encoder.on('error', reject)
    encoder.render()
  })
}

function removeDuplicateFrames(frames: Array<{ patch?: Uint8ClampedArray }>): Array<{ patch?: Uint8ClampedArray }> {
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