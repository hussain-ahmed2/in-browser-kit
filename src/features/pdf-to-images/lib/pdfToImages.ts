import { getPageRangeString, parsePageRange } from './utils'

export type ImageFormat = 'png' | 'jpeg' | 'webp'

export interface PdfToImagesOptions {
  format: ImageFormat
  quality: number
  dpi: number
  pages: number[]
}

export interface PageImage {
  pageNumber: number
  blob: Blob
  width: number
  height: number
}

export interface PdfToImagesResult {
  images: PageImage[]
  totalPages: number
  fileName: string
}

// Dynamically load pdfjs-dist (browser-only; avoids SSR issues with DOMMatrix)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLib: any = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPdfjs(): Promise<any> {
  if (!pdfjsLib) {
    const mod = await import('pdfjs-dist')
    pdfjsLib = mod
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  }
  return pdfjsLib
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadPdf(file: File): Promise<any> {
  const pdfjs = await loadPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  return loadingTask.promise
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPageDimensions(page: any, dpi: number): { width: number; height: number } {
  const viewport = page.getViewport({ scale: dpi / 72 })
  return { width: Math.round(viewport.width), height: Math.round(viewport.height) }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function renderPageToCanvas(page: any, dpi: number): Promise<HTMLCanvasElement> {
  const viewport = page.getViewport({ scale: dpi / 72 })
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  canvas.width = viewport.width
  canvas.height = viewport.height

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }

  await page.render(renderContext).promise
  return canvas
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: 'png' | 'jpeg' | 'webp',
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === 'jpeg' ? 'image/jpeg' : `image/${format}`
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create blob'))
      },
      mimeType,
      quality
    )
  })
}

export async function getPdfPageCount(file: File): Promise<number> {
  const pdf = await loadPdf(file)
  return pdf.numPages
}

export async function convertPdfToImages(
  file: File,
  options: PdfToImagesOptions
): Promise<PdfToImagesResult> {
  await loadPdfjs()
  const pdf = await loadPdf(file)
  const totalPages = pdf.numPages
  const images: PageImage[] = []

  for (const pageNum of options.pages) {
    if (pageNum < 1 || pageNum > totalPages) continue

    const page = await pdf.getPage(pageNum)
    const { width, height } = getPageDimensions(page, options.dpi)
    const canvas = await renderPageToCanvas(page, options.dpi)
    const blob = await canvasToBlob(canvas, options.format, options.quality)

    images.push({
      pageNumber: pageNum,
      blob,
      width,
      height,
    })
  }

  const baseName = file.name.replace(/\.pdf$/i, '')
  return {
    images,
    totalPages,
    fileName: baseName,
  }
}

export { getPageRangeString, parsePageRange }

export const FORMAT_OPTIONS: { value: 'png' | 'jpeg' | 'webp'; label: string }[] = [
  { value: 'png', label: 'PNG (lossless)' },
  { value: 'jpeg', label: 'JPEG (smaller, lossy)' },
  { value: 'webp', label: 'WebP (modern, efficient)' },
]

export const DPI_OPTIONS = [
  { value: 72, label: '72 DPI (screen)' },
  { value: 150, label: '150 DPI (draft print)' },
  { value: 300, label: '300 DPI (print quality)' },
  { value: 600, label: '600 DPI (high quality)' },
]

export const QUALITY_OPTIONS = [
  { value: 0.7, label: '70% (smaller)' },
  { value: 0.85, label: '85% (balanced)' },
  { value: 1.0, label: '100% (best quality)' },
]