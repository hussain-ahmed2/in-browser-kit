import { PDFDocument, degrees } from 'pdf-lib'
import {
    configureStore,
    type Reducer,
    type ReducersMapObject
} from '@reduxjs/toolkit'
import { readPdfBlob } from './setup'

/**
 * Creates an in-memory PDF file with the given page count and returns it as a
 * File, ready to feed into the pdf-tools helpers or feature slices. When
 * `pageRotations` is provided, the i-th page is given that inherent rotation.
 */
export async function makePdfFile(
    name: string,
    pageCount: number,
    pageRotations: number[] = []
): Promise<File> {
    const pdf = await PDFDocument.create()
    for (let i = 0; i < pageCount; i++) {
        const page = pdf.addPage()
        const rotation = pageRotations[i]
        if (rotation) page.setRotation(degrees(rotation))
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
 * Reads a PDF blob from the global test registry by URL.
 */
export async function readPdf(url: string): Promise<PDFDocument> {
    return PDFDocument.load(await readPdfBlob(url).arrayBuffer())
}
