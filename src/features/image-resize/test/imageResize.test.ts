import { describe, expect, it } from 'vitest'
import {
    RESIZE_EXTENSIONS,
    computeResizedDimensions,
    deriveOutputName,
    shouldResize,
    type ResizeOptions,
} from '../lib/imageResize'

describe('computeResizedDimensions', () => {
    it('downscales a wide image to the longest side', () => {
        expect(computeResizedDimensions(1000, 500, 500)).toEqual({
            width: 500,
            height: 250,
        })
    })

    it('downscales a tall image to the longest side', () => {
        expect(computeResizedDimensions(500, 1000, 500)).toEqual({
            width: 250,
            height: 500,
        })
    })

    it('does not upscale images smaller than the target', () => {
        expect(computeResizedDimensions(300, 200, 500)).toEqual({
            width: 300,
            height: 200,
        })
    })

    it('leaves an image exactly at the target unchanged', () => {
        expect(computeResizedDimensions(1920, 1080, 1920)).toEqual({
            width: 1920,
            height: 1080,
        })
    })

    it('rounds fractional dimensions', () => {
        expect(computeResizedDimensions(1000, 333, 700)).toEqual({
            width: 700,
            height: 233,
        })
    })
})

describe('shouldResize', () => {
    const base: ResizeOptions = {
        maxDimension: 1920,
        outputType: 'keep',
        quality: 1,
    }

    it('returns true when the longest side exceeds the target', () => {
        expect(
            shouldResize(4000, 3000, {
                ...base,
                maxDimension: 1920,
            })
        ).toBe(true)
    })

    it('returns true when the output format differs', () => {
        expect(
            shouldResize(1000, 500, { ...base, outputType: 'image/webp' })
        ).toBe(true)
    })

    it('returns true when quality is lossy', () => {
        expect(shouldResize(1000, 500, { ...base, quality: 0.8 })).toBe(true)
    })

    it('returns false when nothing changes', () => {
        expect(shouldResize(1000, 500, base)).toBe(false)
    })
})

describe('deriveOutputName', () => {
    it('keeps the original name for the keep format', () => {
        expect(deriveOutputName('photo.jpg', 'keep')).toBe('photo.jpg')
    })

    it('replaces the extension for JPEG output', () => {
        expect(deriveOutputName('photo.png', 'image/jpeg')).toBe('photo.jpg')
    })

    it('replaces the extension for PNG output', () => {
        expect(deriveOutputName('photo.jpg', 'image/png')).toBe('photo.png')
    })

    it('replaces the extension for WebP output', () => {
        expect(deriveOutputName('photo.jpg', 'image/webp')).toBe('photo.webp')
    })

    it('falls back to image when the name has no extension', () => {
        expect(deriveOutputName('scan', 'image/png')).toBe('scan.png')
    })
})

describe('RESIZE_EXTENSIONS', () => {
    it('maps every output type to an extension (or none for keep)', () => {
        expect(RESIZE_EXTENSIONS.keep).toBeNull()
        expect(RESIZE_EXTENSIONS['image/jpeg']).toBe('jpg')
        expect(RESIZE_EXTENSIONS['image/png']).toBe('png')
        expect(RESIZE_EXTENSIONS['image/webp']).toBe('webp')
    })
})