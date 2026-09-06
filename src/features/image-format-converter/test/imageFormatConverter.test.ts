import { describe, expect, it } from 'vitest'
import { formatBytes, SUPPORTED_FORMATS, type OutputFormat } from '../lib/imageFormatConverter'

describe('SUPPORTED_FORMATS', () => {
  it('has 5 supported formats', () => {
    expect(SUPPORTED_FORMATS).toHaveLength(5)
  })

  it('includes JPEG', () => {
    expect(SUPPORTED_FORMATS.find((f) => f.value === 'image/jpeg')).toEqual({
      value: 'image/jpeg',
      label: 'JPEG',
      extension: 'jpg',
    })
  })

  it('includes PNG', () => {
    expect(SUPPORTED_FORMATS.find((f) => f.value === 'image/png')).toEqual({
      value: 'image/png',
      label: 'PNG',
      extension: 'png',
    })
  })

  it('includes WebP', () => {
    expect(SUPPORTED_FORMATS.find((f) => f.value === 'image/webp')).toEqual({
      value: 'image/webp',
      label: 'WebP',
      extension: 'webp',
    })
  })

  it('includes AVIF', () => {
    expect(SUPPORTED_FORMATS.find((f) => f.value === 'image/avif')).toEqual({
      value: 'image/avif',
      label: 'AVIF',
      extension: 'avif',
    })
  })

  it('includes BMP', () => {
    expect(SUPPORTED_FORMATS.find((f) => f.value === 'image/bmp')).toEqual({
      value: 'image/bmp',
      label: 'BMP',
      extension: 'bmp',
    })
  })

  it('every format has a unique value', () => {
    const values = SUPPORTED_FORMATS.map((f) => f.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('OutputFormat type', () => {
  it('accepts all valid format values', () => {
    const formats: OutputFormat[] = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/bmp',
    ]
    expect(formats).toHaveLength(5)
  })
})
