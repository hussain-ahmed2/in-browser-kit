import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist'

let workerConfigured = false

async function configureWorker(): Promise<void> {
    if (workerConfigured) return
    // The worker is committed under /public (synced from pdfjs-dist) because
    // the Turbopack asset-URL import does not resolve node_modules packages.
    const { GlobalWorkerOptions } = await import('pdfjs-dist')
    GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
    workerConfigured = true
}

/**
 * Creates a pdfjs loading task for the given PDF bytes. pdfjs-dist is
 * imported lazily so its browser-only module evaluation (e.g. DOMMatrix)
 * never runs during server-side prerendering.
 */
export async function createPdfLoadingTask(
    data: ArrayBuffer
): Promise<PDFDocumentLoadingTask> {
    await configureWorker()
    const { getDocument } = await import('pdfjs-dist')
    return getDocument({ data })
}

export interface ThumbnailOptions {
    /** Cap on the rendered thumbnail width in CSS pixels. */
    maxWidth?: number
    /** Rotation in degrees (0/90/180/270) applied on top of the page's own. */
    rotation?: number
}

export async function renderPageThumbnail(
    pdf: PDFDocumentProxy,
    pageNumber: number,
    canvas: HTMLCanvasElement,
    options: ThumbnailOptions = {}
): Promise<void> {
    const page = await pdf.getPage(pageNumber)
    const liveRotation = options.rotation ?? 0
    // The viewport `rotation` overrides the page's inherent rotation, so fold
    // the two together to keep already-rotated pages upright.
    const totalRotation = (page.rotate + liveRotation) % 360
    const baseViewport = page.getViewport({
        scale: 1,
        rotation: totalRotation
    })
    const scale = Math.min(1, (options.maxWidth ?? 180) / baseViewport.width)
    const viewport = page.getViewport({ scale, rotation: totalRotation })

    canvas.width = Math.floor(viewport.width)
    canvas.height = Math.floor(viewport.height)

    await page.render({ canvas, viewport }).promise
    page.cleanup()
}
