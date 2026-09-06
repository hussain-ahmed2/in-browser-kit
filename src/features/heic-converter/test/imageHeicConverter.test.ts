import { describe, expect, it } from 'vitest'
import { formatBytes, SUPPORTED_OUTPUT_FORMATS } from '../lib/imageHeicConverter'
import { heicConverterSchema } from '../types'

describe('SUPPORTED_OUTPUT_FORMATS', () => {
  it('has 2 supported formats', () => {
    expect(SUPPORTED_OUTPUT_FORMATS).toHaveLength(2)
  })

  it('includes JPEG', () => {
    expect(SUPPORTED_OUTPUT_FORMATS.find((f) => f.value === 'image/jpeg')).toEqual({
      value: 'image/jpeg',
      label: 'JPEG',
      extension: 'jpg',
    })
  })

  it('includes PNG', () => {
    expect(SUPPORTED_OUTPUT_FORMATS.find((f) => f.value === 'image/png')).toEqual({
      value: 'image/png',
      label: 'PNG',
      extension: 'png',
    })
  })

  it('every format has a unique value', () => {
    const values = SUPPORTED_OUTPUT_FORMATS.map((f) => f.value)
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

describe('heicConverterSchema', () => {
  it('defaults to image/jpeg format', () => {
    const result = heicConverterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.format).toBe('image/jpeg')
    }
  })

  it('defaults quality to 0.9', () => {
    const result = heicConverterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quality).toBe(0.9)
    }
  })

  it('accepts valid format values', () => {
    expect(heicConverterSchema.safeParse({ format: 'image/jpeg' }).success).toBe(true)
    expect(heicConverterSchema.safeParse({ format: 'image/png' }).success).toBe(true)
  })

  it('rejects invalid format values', () => {
    expect(heicConverterSchema.safeParse({ format: 'image/webp' }).success).toBe(false)
  })

  it('rejects quality below 0.1', () => {
    expect(heicConverterSchema.safeParse({ quality: 0.05 }).success).toBe(false)
  })

  it('rejects quality above 1.0', () => {
    expect(heicConverterSchema.safeParse({ quality: 1.1 }).success).toBe(false)
  })

  it('accepts quality at boundaries', () => {
    expect(heicConverterSchema.safeParse({ quality: 0.1 }).success).toBe(true)
    expect(heicConverterSchema.safeParse({ quality: 1.0 }).success).toBe(true)
  })
})
