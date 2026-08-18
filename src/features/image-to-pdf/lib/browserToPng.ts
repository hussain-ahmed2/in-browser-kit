'use client'

/**
 * Browser-only helper: converts any decodable image (WebP, GIF, BMP, etc.)
 * into PNG bytes via an offscreen canvas. Kept separate from the pure lib so
 * canvas APIs never run in the node test environment.
 */
export async function convertToPng(file: File): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Canvas 2D context unavailable.')
  }
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) {
    throw new Error('Failed to convert image to PNG.')
  }
  return new Uint8Array(await blob.arrayBuffer())
}
