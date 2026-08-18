import { PDFDocument, type PDFImage, type PDFPage } from 'pdf-lib'

export function pdfBytesToBlobUrl(bytes: Uint8Array): string {
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: 'application/pdf',
  })
  return URL.createObjectURL(blob)
}

export type PdfPageSize = 'fit' | 'a4' | 'letter'

export const PAGE_SIZE_OPTIONS: readonly PdfPageSize[] = ['fit', 'a4', 'letter']

export const PAGE_SIZE_LABELS: Record<PdfPageSize, string> = {
  fit: 'Fit to image',
  a4: 'A4',
  letter: 'Letter',
}

export const PAGE_SIZE_POINTS: Record<PdfPageSize, [number, number] | null> = {
  fit: null,
  a4: [595.28, 841.89],
  letter: [612, 792],
}

/** Largest page dimension allowed when using `fit` sizing, in points. */
export const MAX_FIT_POINTS = 1200

export interface ImageToPdfOptions {
  pageSize: PdfPageSize
  margin: number
}

/**
 * Reads the intrinsic pixel size of an image file using the browser's
 * image decoding when available, falling back to undefined in test
 * environments (node).
 */
export async function readImageSize(file: File): Promise<
  { width: number; height: number } | undefined
> {
  const { createImageBitmap } = globalThis as { createImageBitmap?: (b: Blob) => Promise<ImageBitmap> }
  if (typeof createImageBitmap !== 'function') return undefined
  try {
    const bitmap = await createImageBitmap(file)
    const size = { width: bitmap.width, height: bitmap.height }
    bitmap.close()
    return size
  } catch {
    return undefined
  }
}

export type ImageFormat = 'png' | 'jpeg' | 'other'

/**
 * Sniffs the actual image format from the leading magic bytes instead of
 * trusting the file's MIME type, which is often wrong (e.g. a PNG saved with
 * a `.jpg` extension). Falls back to `other` for anything unrecognized.
 */
export function sniffImageFormat(bytes: Uint8Array): ImageFormat {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 && // P
    bytes[2] === 0x4e && // N
    bytes[3] === 0x47 && // G
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return 'png'
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return 'jpeg'
  }
  return 'other'
}

/**
 * Embeds a single image into the document, dispatching on the actual byte
 * content (not the MIME type). PNG and JPEG are embedded natively; everything
 * else is converted to PNG by the provided converter. If pdf-lib rejects a
 * JPEG (some CMYK/progressive variants), the browser decoder re-encodes it.
 */
export async function embedImage(
  pdf: PDFDocument,
  file: File,
  convertToPng: (file: File) => Promise<Uint8Array>
): Promise<PDFImage> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const format = sniffImageFormat(bytes)
  if (format === 'png') {
    return pdf.embedPng(bytes)
  }
  if (format === 'jpeg') {
    try {
      return pdf.embedJpg(bytes)
    } catch {
      return pdf.embedPng(await convertToPng(file))
    }
  }
  return pdf.embedPng(await convertToPng(file))
}

/**
 * Sizes a page for the given image according to the selected page size.
 * `fit` produces a page that matches the image dimensions plus the requested
 * margin on every side, capped at MAX_FIT_POINTS so absurdly large images
 * don't create huge pages. Fixed sizes use the standard page dimensions.
 */
export function resolvePageSize(
  imageWidth: number,
  imageHeight: number,
  pageSize: PdfPageSize,
  margin: number
): [number, number] {
  if (pageSize !== 'fit') {
    return PAGE_SIZE_POINTS[pageSize]!
  }
  const available = Math.max(1, MAX_FIT_POINTS - margin * 2)
  const scale = Math.min(1, available / Math.max(imageWidth, imageHeight))
  return [
    Math.round(imageWidth * scale) + margin * 2,
    Math.round(imageHeight * scale) + margin * 2,
  ]
}

export interface ContainDraw {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Computes the draw box that fits an image inside a page with the given
 * margin, preserving aspect ratio. When the page aspect matches the image
 * aspect (as with `fit` sizing) the inset is exactly `margin` on all sides.
 */
export function computeContainDraw(
  imageWidth: number,
  imageHeight: number,
  pageWidth: number,
  pageHeight: number,
  margin: number
): ContainDraw {
  const availWidth = Math.max(1, pageWidth - margin * 2)
  const availHeight = Math.max(1, pageHeight - margin * 2)
  const scale = Math.min(availWidth / imageWidth, availHeight / imageHeight)
  const width = imageWidth * scale
  const height = imageHeight * scale
  return {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  }
}

function drawContain(
  page: PDFPage,
  image: PDFImage,
  pageWidth: number,
  pageHeight: number,
  margin: number
): void {
  const { x, y, width, height } = computeContainDraw(
    image.width,
    image.height,
    pageWidth,
    pageHeight,
    margin
  )
  page.drawImage(image, { x, y, width, height })
}

/**
 * Combines images into a single PDF document — one image per page.
 * Order follows `files`; results are returned as PDF bytes.
 */
export async function imagesToPdf(
  files: File[],
  options: ImageToPdfOptions,
  convertToPng: (file: File) => Promise<Uint8Array> = async (file) => {
    throw new Error(`Unsupported image type: ${file.type}`)
  }
): Promise<Uint8Array> {
  if (files.length === 0) {
    throw new Error('No images selected.')
  }

  const pdf = await PDFDocument.create()

  for (const file of files) {
    const image = await embedImage(pdf, file, convertToPng)
    const size = await readImageSize(file)
    const [pageWidth, pageHeight] = resolvePageSize(
      size?.width ?? image.width,
      size?.height ?? image.height,
      options.pageSize,
      options.margin
    )
    const page = pdf.addPage([pageWidth, pageHeight])
    drawContain(page, image, pageWidth, pageHeight, options.margin)
  }

  return pdf.save()
}
