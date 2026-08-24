import { parseGIF, decompressFrames, type GIFFrame, type GIF } from 'gifuct-js'

export interface GifFrame {
  index: number
  delay: number
  disposalType: number
  dims: {
    top: number
    left: number
    width: number
    height: number
  }
  colorTable: number[]
  transparentIndex?: number
  patch?: Uint8ClampedArray
  dataUrl?: string
  blob?: Blob
}

export interface GifExtractorResult {
  frames: {
    index: number
    delay: number
    disposalType: number
    dims: {
      top: number
      left: number
      width: number
      height: number
    }
    colorTable: number[]
    transparentIndex?: number
    patch?: Uint8ClampedArray
    dataUrl?: string
    blob?: Blob
  }[]
  width: number
  height: number
  loopCount: number
  totalDuration: number
  fileSize: number
}

export interface GifInfo {
  width: number
  height: number
  frameCount: number
  loopCount: number
  totalDuration: number
  fileSize: number
}

export async function extractGifFrames(file: File): Promise<GifExtractorResult> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Parse GIF
  const gif = parseGIF(uint8Array)

  // Decompress frames with patches
  const frames = decompressFrames(gif, true)

  // Convert frames to our format
  const framesData = frames.map((frame, index) => {
    const dims = frame.dims || { top: 0, left: 0, width: gif.lsd?.width || 0, height: gif.lsd?.height || 0 }
    
    // Create data URL for preview
    let dataUrl: string | undefined
    if (frame.patch) {
      const canvas = document.createElement('canvas')
      canvas.width = dims.width
      canvas.height = dims.height
      const ctx = canvas.getContext('2d')!
      const imageData = new ImageData(
        new Uint8ClampedArray(frame.patch),
        dims.width,
        dims.height
      )
      ctx.putImageData(imageData, 0, 0)
      dataUrl = canvas.toDataURL('image/png')
    }

    return {
      index,
      delay: frame.delay || 100,
      disposalType: frame.disposalType || 0,
      dims: {
        top: dims.top,
        left: dims.left,
        width: dims.width,
        height: dims.height,
      },
      colorTable: frame.colorTable || [],
      transparentIndex: frame.transparentIndex,
      patch: frame.patch,
      dataUrl,
    }
  })

  const totalDuration = frames.reduce((sum, f) => sum + (f.delay || 100), 0)
  const loopCount = gif.lsd?.loopCount || 0

  return {
    frames: framesData,
    width: gif.lsd?.width || 0,
    height: gif.lsd?.height || 0,
    loopCount,
    totalDuration,
    fileSize: 0, // Will be set by caller
  }
}

export async function getGifInfo(file: File): Promise<GifInfo> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  
  const gif = parseGIF(uint8Array)
  const frames = decompressFrames(gif, false)
  
  const totalDuration = frames.reduce((sum, f) => sum + (f.delay || 100), 0)
  const loopCount = gif.lsd?.loopCount || 0

  return {
    width: gif.lsd?.width || 0,
    height: gif.lsd?.height || 0,
    frameCount: frames.length,
    loopCount,
    totalDuration,
    fileSize: 0, // Will be set by caller
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}