import { PDFDocument, degrees } from 'pdf-lib'
import sharp from 'sharp'
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

/**
 * Creates an in-memory PNG image file with the given pixel dimensions.
 */
export async function makePngFile(
    name: string,
    width = 100,
    height = 50
): Promise<File> {
    const buffer = await sharp({
        create: {
            width,
            height,
            channels: 4,
            background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
    })
        .png()
        .toBuffer()
    return new File([buffer as unknown as BlobPart], name, {
        type: 'image/png'
    })
}

/**
 * Creates an in-memory JPEG image file with the given pixel dimensions.
 */
export async function makeJpegFile(
    name: string,
    width = 100,
    height = 50
): Promise<File> {
    const buffer = await sharp({
        create: {
            width,
            height,
            channels: 3,
            background: { r: 0, g: 0, b: 255 }
        }
    })
        .jpeg()
        .toBuffer()
    return new File([buffer as unknown as BlobPart], name, {
        type: 'image/jpeg'
    })
}
