'use client'

import { useEffect, useRef } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { renderPageThumbnail } from '../lib/preview'

interface PageThumbProps {
    pdf: PDFDocumentProxy
    pageNumber: number
    rotation: number
}

function PageThumb({ pdf, pageNumber, rotation }: PageThumbProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        void renderPageThumbnail(pdf, pageNumber, canvas, { rotation }).catch(
            () => {
                // Leave the cell blank if a single page fails to render.
            }
        )
    }, [pdf, pageNumber, rotation])

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-auto"
            aria-label={`Page ${pageNumber} preview`}
        />
    )
}

interface PdfPageGridProps {
    pdf: PDFDocumentProxy
    /** Slot rendered beneath each page thumbnail (e.g. rotate / delete controls). */
    renderPageActions?: (pageNumber: number) => React.ReactNode
    /** Slot rendered absolutely over each thumbnail (e.g. a "Removed" mask). */
    renderPageOverlay?: (pageNumber: number) => React.ReactNode
    /** Optional toolbar shown in the grid header. */
    toolbar?: React.ReactNode
    /** Per-page rotation (degrees) applied to the rendered preview. */
    getPageRotation?: (pageNumber: number) => number
}

export function PdfPageGrid({
    pdf,
    renderPageActions,
    renderPageOverlay,
    toolbar,
    getPageRotation = () => 0
}: PdfPageGridProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground tabular-nums">
                    {pdf.numPages} page{pdf.numPages === 1 ? '' : 's'}
                </p>
                {toolbar}
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: pdf.numPages }, (_, index) => {
                    const pageNumber = index + 1
                    const actions = renderPageActions?.(pageNumber)
                    const overlay = renderPageOverlay?.(pageNumber)
                    return (
                        <li
                            key={pageNumber}
                            className="relative rounded-lg border border-border bg-secondary/20 p-2 space-y-2"
                        >
                            <div className="relative overflow-hidden rounded-md bg-white shadow-sm">
                                <PageThumb
                                    pdf={pdf}
                                    pageNumber={pageNumber}
                                    rotation={getPageRotation(pageNumber)}
                                />
                                <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white pointer-events-none">
                                    {pageNumber}
                                </span>
                                {overlay}
                            </div>
                            {actions && (
                                <div className="flex items-center justify-center gap-1.5">
                                    {actions}
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}
