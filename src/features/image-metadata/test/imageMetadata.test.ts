import { describe, expect, it } from 'vitest'
import {
    formatBytes,
    formatExposure,
    formatAperture,
    formatFocalLength,
    formatGps,
    formatGpsDms,
    formatDate,
    normalizeMetadata,
    type NormalizeInput
} from '../lib/imageMetadata'

function makeInput(overrides: Partial<NormalizeInput> = {}): NormalizeInput {
    return {
        name: 'photo.jpg',
        size: 2_500_000,
        type: 'image/jpeg',
        width: 4000,
        height: 3000,
        output: {},
        ...overrides
    }
}

describe('Image Metadata', () => {
    describe('formatBytes', () => {
        it('formats bytes', () => {
            expect(formatBytes(512)).toBe('512 B')
            expect(formatBytes(2048)).toBe('2.0 KB')
            expect(formatBytes(2_500_000)).toBe('2.4 MB')
        })

        it('handles zero and negatives', () => {
            expect(formatBytes(0)).toBe('0 B')
            expect(formatBytes(-5)).toBe('0 B')
        })
    })

    describe('formatExposure', () => {
        it('formats fractional seconds as 1/n', () => {
            expect(formatExposure(0.01)).toBe('1/100 s')
            expect(formatExposure(0.001)).toBe('1/1000 s')
        })

        it('formats whole seconds', () => {
            expect(formatExposure(1)).toBe('1.0 s')
            expect(formatExposure(2.5)).toBe('2.5 s')
        })

        it('handles invalid values', () => {
            expect(formatExposure(0)).toBeNull()
            expect(formatExposure(-1)).toBeNull()
            expect(formatExposure('1/100')).toBeNull()
        })
    })

    describe('formatAperture', () => {
        it('formats f-number', () => {
            expect(formatAperture(2.8)).toBe('f/2.80')
            expect(formatAperture(1.4)).toBe('f/1.40')
            expect(formatAperture(22)).toBe('f/22.0')
        })

        it('handles invalid values', () => {
            expect(formatAperture(0)).toBeNull()
            expect(formatAperture(undefined)).toBeNull()
        })
    })

    describe('formatFocalLength', () => {
        it('formats focal length', () => {
            expect(formatFocalLength(50)).toBe('50 mm')
            expect(formatFocalLength(4.5)).toBe('4.5 mm')
        })

        it('handles invalid values', () => {
            expect(formatFocalLength(0)).toBeNull()
            expect(formatFocalLength(-3)).toBeNull()
        })
    })

    describe('formatGps', () => {
        it('formats coordinates with hemisphere', () => {
            expect(formatGps(12.5, 45.5)).toBe('12.500000° N, 45.500000° E')
            expect(formatGps(-12.5, -45.5)).toBe('12.500000° S, 45.500000° W')
        })
    })

    describe('formatGpsDms', () => {
        it('formats degrees/minutes/seconds with reference', () => {
            expect(formatGpsDms([12, 30, 0], 'N')).toBe('12° 30\' 0.00" N')
        })

        it('returns null for invalid input', () => {
            expect(formatGpsDms([12], 'N')).toBeNull()
            expect(formatGpsDms(null, null)).toBeNull()
        })
    })

    describe('formatDate', () => {
        it('formats Date objects', () => {
            const d = new Date(2023, 0, 15, 10, 30, 0)
            expect(formatDate(d)).toBe(d.toLocaleString())
        })

        it('formats date strings', () => {
            expect(formatDate('2023-01-15T10:30:00Z')).not.toBeNull()
            expect(formatDate('not a date')).toBe('not a date')
        })

        it('handles invalid values', () => {
            expect(formatDate(null)).toBeNull()
            expect(formatDate(new Date('invalid'))).toBeNull()
        })
    })

    describe('normalizeMetadata', () => {
        it('includes file info and dimensions in the File group', () => {
            const meta = normalizeMetadata(makeInput())
            expect(meta.name).toBe('photo.jpg')
            expect(meta.sizeLabel).toBe('2.4 MB')
            expect(meta.width).toBe(4000)
            expect(meta.height).toBe(3000)

            const fileGroup = meta.groups.find((g) => g.title === 'File')
            expect(fileGroup?.rows).toContainEqual({ label: 'Name', value: 'photo.jpg' })
            expect(fileGroup?.rows).toContainEqual({ label: 'Dimensions', value: '4000 × 3000 px' })
        })

        it('groups camera EXIF tags into Camera group', () => {
            const meta = normalizeMetadata(
                makeInput({
                    output: {
                        Make: 'Nikon',
                        Model: 'Z6',
                        FNumber: 2.8,
                        ExposureTime: 0.01,
                        ISO: 400,
                        FocalLength: 50,
                        DateTimeOriginal: new Date(2023, 0, 15, 10, 30, 0)
                    }
                })
            )
            const camera = meta.groups.find((g) => g.title === 'Camera')
            expect(camera?.rows).toContainEqual({ label: 'Camera Make', value: 'Nikon' })
            expect(camera?.rows).toContainEqual({ label: 'Camera Model', value: 'Z6' })
            expect(camera?.rows).toContainEqual({ label: 'Aperture', value: 'f/2.80' })
            expect(camera?.rows).toContainEqual({ label: 'Exposure', value: '1/100 s' })
            expect(camera?.rows).toContainEqual({ label: 'ISO', value: '400' })
            expect(camera?.rows).toContainEqual({ label: 'Focal Length', value: '50 mm' })
        })

        it('captures GPS coordinates and Location group', () => {
            const meta = normalizeMetadata(
                makeInput({
                    output: {
                        latitude: 12.5,
                        longitude: 45.5,
                        GPSLatitude: [12, 30, 0],
                        GPSLatitudeRef: 'N',
                        GPSLongitude: [45, 30, 0],
                        GPSLongitudeRef: 'E',
                        GPSAltitude: 100
                    }
                })
            )
            expect(meta.gps).toEqual({ latitude: 12.5, longitude: 45.5 })
            const location = meta.groups.find((g) => g.title === 'Location')
            expect(location?.rows).toContainEqual({ label: 'Latitude', value: '12.500000° N' })
            expect(location?.rows).toContainEqual({ label: 'Longitude (DMS)', value: '45° 30\' 0.00" E' })
            expect(location?.rows).toContainEqual({ label: 'Altitude (m)', value: '100' })
        })

        it('extracts IPTC description fields', () => {
            const meta = normalizeMetadata(
                makeInput({
                    output: {
                        Headline: 'Sunset',
                        Keywords: ['nature', 'sky'],
                        Copyright: '© 2023 Example'
                    }
                })
            )
            const description = meta.groups.find((g) => g.title === 'Description')
            expect(description?.rows).toContainEqual({ label: 'Headline', value: 'Sunset' })
            expect(description?.rows).toContainEqual({ label: 'Keywords', value: 'nature, sky' })
            expect(description?.rows).toContainEqual({ label: 'Copyright', value: '© 2023 Example' })
        })

        it('omits empty groups and skips undefined values', () => {
            const meta = normalizeMetadata(makeInput({ output: {} }))
            expect(meta.gps).toBeNull()
            expect(meta.groups.length).toBe(1)
            expect(meta.groups[0].title).toBe('File')
        })

        it('omits groups with no populated rows', () => {
            const meta = normalizeMetadata(makeInput({ output: { Make: 'Sony' } }))
            const titles = meta.groups.map((g) => g.title)
            expect(titles).toContain('Camera')
            expect(titles).not.toContain('Location')
            expect(titles).not.toContain('Description')
        })
    })
})