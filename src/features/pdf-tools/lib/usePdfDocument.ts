'use client'

import { useEffect, useState } from 'react'
import type {
    PDFDocumentLoadingTask,
    PDFDocumentProxy
} from 'pdfjs-dist'
import { createPdfLoadingTask } from './preview'

interface UsePdfDocumentResult {
    pdf: PDFDocumentProxy | null
    error: string | null
}

/**
 * Loads a pdfjs document for a File and keeps it in sync with the file.
 * The loading task (and its worker) is destroyed when the file changes or
 * the component unmounts.
 */
export function usePdfDocument(file: File | null): UsePdfDocumentResult {
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!file) return

        let cancelled = false
        let task: PDFDocumentLoadingTask | null = null

        void (async () => {
            try {
                const data = await file.arrayBuffer()
                if (cancelled) return
                task = await createPdfLoadingTask(data)
                const doc = await task.promise
                if (cancelled) {
                    void task.destroy()
                    return
                }
                setPdf(doc)
            } catch {
                if (!cancelled) {
                    setError(
                        'Could not read this PDF. It may be password-protected or corrupt.'
                    )
                }
            }
        })()

        return () => {
            cancelled = true
            if (task) void task.destroy()
        }
    }, [file])

    return { pdf, error }
}
