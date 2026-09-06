import { describe, expect, it } from 'vitest'
import { OCR_LANGUAGES, formatBytes } from '../lib/imageOcr'

describe('OCR_LANGUAGES', () => {
  it('has 10 languages', () => { expect(OCR_LANGUAGES).toHaveLength(10) })
  it('includes English', () => { expect(OCR_LANGUAGES.find((l) => l.value === 'eng')).toBeDefined() })
  it('has unique values', () => {
    const values = OCR_LANGUAGES.map((l) => l.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})
