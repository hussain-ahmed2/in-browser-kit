export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface CropResult {
  file: File
  width: number
  height: number
  objectUrl: string
}

export type AspectRatio = 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16'

export const ASPECT_RATIOS: Record<AspectRatio, number | null> = {
  free: null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '3:2': 3 / 2,
  '9:16': 9 / 16,
}

export function constrainCropArea(
  area: CropArea,
  imageWidth: number,
  imageHeight: number,
  aspectRatio: number | null
): CropArea {
  let { x, y, width, height } = area

  width = Math.min(width, imageWidth)
  height = Math.min(height, imageHeight)

  if (aspectRatio !== null) {
    const currentRatio = width / height
    if (currentRatio > aspectRatio) {
      width = height * aspectRatio
    } else {
      height = width / aspectRatio
    }
  }

  x = Math.max(0, Math.min(x, imageWidth - width))
  y = Math.max(0, Math.min(y, imageHeight - height))

  return { x, y, width, height }
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

function blobToFile(blob: Blob, original: File): File {
  return new File([blob], original.name, {
    type: blob.type || original.type,
    lastModified: Date.now(),
  })
}

export async function cropImage(
  file: File,
  area: CropArea
): Promise<CropResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = area.width
  canvas.height = area.height
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(
    img,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    area.width,
    area.height
  )

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = blobToFile(blob, file)
  const objectUrl = URL.createObjectURL(resultFile)

  return {
    file: resultFile,
    width: area.width,
    height: area.height,
    objectUrl,
  }
}

export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)
  return { width: img.naturalWidth, height: img.naturalHeight }
}
