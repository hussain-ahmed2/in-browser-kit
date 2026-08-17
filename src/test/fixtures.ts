import { PDFDocument } from 'pdf-lib'
import {
    configureStore,
    type Reducer,
    type ReducersMapObject
} from '@reduxjs/toolkit'

/**
 * Creates an in-memory PDF file with the given page count and returns it as a
 * File, ready to feed into the pdf-tools helpers or feature slices.
 */
export async function makePdfFile(
    name: string,
    pageCount: number
): Promise<File> {
    const pdf = await PDFDocument.create()
    for (let i = 0; i < pageCount; i++) {
        pdf.addPage()
    }
    const bytes = await pdf.save()
    return new File([bytes.buffer as ArrayBuffer], name, {
        type: 'application/pdf'
    })
}

/**
 * Wraps a reducer map in a minimal store (serializableCheck disabled so File
 * objects and blob URLs can live in state without noisy warnings). Slices are
 * keyed by their name so thunks can read `getState().<slice>`.
 */
export function createTestStore(reducer: Reducer | ReducersMapObject) {
    return configureStore({
        reducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false })
    })
}

/**
 * Stubs `URL.createObjectURL`/`URL.revokeObjectURL` and tracks every blob so
 * tests can read the produced bytes back out of a result URL.
 */
export function createObjectUrlRegistry() {
    const blobs = new Map<string, Blob>()
    let next = 0

    const originalCreate = URL.createObjectURL
    const originalRevoke = URL.revokeObjectURL

    URL.createObjectURL = (blob: Blob) => {
        const url = `blob:mock-${next++}`
        blobs.set(url, blob)
        return url
    }
    URL.revokeObjectURL = (url: string) => {
        blobs.delete(url)
    }

    return {
        async readPdf(url: string): Promise<PDFDocument> {
            const blob = blobs.get(url)
            if (!blob) throw new Error(`Unknown blob URL: ${url}`)
            return PDFDocument.load(await blob.arrayBuffer())
        },
        restore() {
            URL.createObjectURL = originalCreate
            URL.revokeObjectURL = originalRevoke
        }
    }
}