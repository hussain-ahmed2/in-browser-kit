export type FlipDirection = 'horizontal' | 'vertical'

export interface RotateOptions {
  degrees: number
  flip?: FlipDirection
}

export interface RotateResult {
  file: File
  width: number
  height: number
  objectUrl: string
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function blobToFile(blob: Blob, original: File): File {
  return new File([blob], original.name, {
    type: blob.type || original.type,
    lastModified: Date.now(),
  })
}

export async function rotateImage(
  file: File,
  options: RotateOptions
): Promise<RotateResult> {
  const img = await loadImageFromFile(file)
  const radians = (options.degrees * Math.PI) / 180

  const needsSwap =
    options.degrees % 180 !== 0 && options.degrees % 90 === 0

  const canvasW = needsSwap ? img.naturalHeight : img.naturalWidth
  const canvasH = needsSwap ? img.naturalWidth : img.naturalHeight

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  ctx.translate(canvasW / 2, canvasH / 2)
  ctx.rotate(radians)
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = blobToFile(blob, file)
  const objectUrl = URL.createObjectURL(resultFile)

  return {
    file: resultFile,
    width: canvas.width,
    height: canvas.height,
    objectUrl,
  }
}

export async function flipImage(
  file: File,
  direction: FlipDirection
): Promise<RotateResult> {
  const img = await loadImageFromFile(file)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  if (direction === 'horizontal') {
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, canvas.height)
    ctx.scale(1, -1)
  }

  ctx.drawImage(img, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )

  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = blobToFile(blob, file)
  const objectUrl = URL.createObjectURL(resultFile)

  return {
    file: resultFile,
    width: canvas.width,
    height: canvas.height,
    objectUrl,
  }
}
