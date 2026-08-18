import imageCompression from 'browser-image-compression'

export type ResizeOutputType = 'keep' | 'image/jpeg' | 'image/png' | 'image/webp'

export interface ResizeOptions {
  /** Longest side target in pixels. Images are scaled down proportionally. */
  maxDimension: number
  outputType: ResizeOutputType
  /** 0.1 – 1. Only meaningful for lossy formats (JPEG/WebP). */
  quality: number
}

export interface ImageDimensions {
  width: number
  height: number
}

export interface ResizeResult {
  file: File
  originalWidth: number
  originalHeight: number
  resizedWidth: number
  resizedHeight: number
  skipped: boolean
}

/**
 * Reads the intrinsic pixel dimensions of an image file using the browser's
 * image decoding.
 */
export async function getImageDimensions(
  file: File
): Promise<ImageDimensions> {
  const dataUrl = await imageCompression.getDataUrlFromFile(file)
  const image = await imageCompression.loadImage(dataUrl)
  const dims = { width: image.naturalWidth, height: image.naturalHeight }
  image.remove?.()
  return dims
}

/**
 * Returns true when the resize pipeline should run at all. The original file
 * is used unchanged when the image already fits the target dimension, the
 * output format matches the input, and the quality is lossless.
 */
export function shouldResize(
  originalWidth: number,
  originalHeight: number,
  options: ResizeOptions
): boolean {
  if (options.maxDimension < Math.max(originalWidth, originalHeight)) {
    return true
  }
  if (options.outputType !== 'keep') {
    return true
  }
  return options.quality < 1
}

/**
 * Computes the resized dimensions after scaling the longest side down to
 * `maxDimension`, preserving aspect ratio. Never upscales.
 */
export function computeResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxDimension: number
): ImageDimensions {
  const longest = Math.max(originalWidth, originalHeight)
  if (longest <= maxDimension) {
    return { width: originalWidth, height: originalHeight }
  }
  const scale = maxDimension / longest
  return {
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
  }
}

export const RESIZE_EXTENSIONS: Record<ResizeOutputType, string | null> = {
  keep: null,
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export function deriveOutputName(
  originalName: string,
  outputType: ResizeOutputType
): string {
  const base = originalName.replace(/\.[^./]+$/, '') || 'image'
  const extension = RESIZE_EXTENSIONS[outputType]
  return extension ? `${base}.${extension}` : originalName
}

/**
 * Resizes and/or converts a single image in the browser. When no change is
 * required (already within the target size, same format, full quality) the
 * original file is returned untouched.
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions
): Promise<ResizeResult> {
  const { width, height } = await getImageDimensions(file)
  const dims = computeResizedDimensions(width, height, options.maxDimension)

  if (!shouldResize(width, height, options)) {
    return {
      file,
      originalWidth: width,
      originalHeight: height,
      resizedWidth: width,
      resizedHeight: height,
      skipped: true,
    }
  }

  const compressed = await imageCompression(file, {
    maxWidthOrHeight: options.maxDimension,
    fileType: options.outputType === 'keep' ? undefined : options.outputType,
    initialQuality: options.quality,
    useWebWorker: true,
    alwaysKeepResolution: false,
  })

  return {
    file: compressed,
    originalWidth: width,
    originalHeight: height,
    resizedWidth: dims.width,
    resizedHeight: dims.height,
    skipped: false,
  }
}