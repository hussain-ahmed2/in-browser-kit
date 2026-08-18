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
    isEncrypted: boolean
}

/**
 * Loads a pdfjs document for a File and keeps it in sync with the file.
 * The loading task (and its worker) is destroyed when the file changes or
 * the component unmounts.
 * 
 * Detects encryption by attempting to load without a password first.
 * If PasswordException is thrown, returns isEncrypted: true.
 */
export function usePdfDocument(file: File | null): UsePdfDocumentResult {
    const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isEncrypted, setIsEncrypted] = useState(false)

    useEffect(() => {
        if (!file) {
            return
        }

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
                setIsEncrypted(false)
                setError(null)
            } catch (err) {
                if (cancelled) return

                // Check if it's a PasswordException (encrypted PDF)
                if (err instanceof Error && 'code' in err && err.code === 1) {
                    // PasswordException has code = 1 (NEED_PASSWORD)
                    setIsEncrypted(true)
                    setError(null)
                    return
                }

                setError(
                    'Could not read this PDF. It may be password-protected or corrupt.'
                )
                setIsEncrypted(false)
            }
        })()

        return () => {
            cancelled = true
            if (task) void task.destroy()
        }
    }, [file])

    // Reset state when file is null
    if (!file) {
        return { pdf: null, error: null, isEncrypted: false }
    }

    return { pdf, error, isEncrypted }
}