import { describe, it, expect } from 'vitest'
import {
  QR_EC_LEVELS,
  QR_CAPACITY_BYTES,
  getCapacityChars,
  validateQrInput,
  generateQrDataUrl,
  generateQrSvg,
} from '../lib/qr'

describe('qr-generator lib', () => {
  describe('constants', () => {
    it('has all four EC levels', () => {
      expect(QR_EC_LEVELS).toEqual(['L', 'M', 'Q', 'H'])
    })

    it('has capacity bytes for each EC level', () => {
      expect(QR_CAPACITY_BYTES.L).toBe(2953)
      expect(QR_CAPACITY_BYTES.M).toBe(2331)
      expect(QR_CAPACITY_BYTES.Q).toBe(1663)
      expect(QR_CAPACITY_BYTES.H).toBe(1273)
    })

    it('getCapacityChars returns correct values', () => {
      expect(getCapacityChars('L')).toBe(2953)
      expect(getCapacityChars('M')).toBe(2331)
      expect(getCapacityChars('Q')).toBe(1663)
      expect(getCapacityChars('H')).toBe(1273)
    })
  })

  describe('validateQrInput', () => {
    it('rejects empty string', () => {
      expect(validateQrInput('', 'M')).toBe('Enter text or a URL to generate a QR code.')
    })

    it('rejects whitespace only', () => {
      expect(validateQrInput('   ', 'M')).toBe('Enter text or a URL to generate a QR code.')
    })

    it('accepts valid short input', () => {
      expect(validateQrInput('hello', 'M')).toBeNull()
    })

    it('rejects input exceeding capacity for L', () => {
      const longText = 'a'.repeat(3000)
      expect(validateQrInput(longText, 'L')).toContain('too long')
    })

    it('rejects input exceeding capacity for H', () => {
      const longText = 'a'.repeat(1300)
      expect(validateQrInput(longText, 'H')).toContain('too long')
    })

    it('accepts input at capacity boundary for L', () => {
      const maxText = 'a'.repeat(2953)
      expect(validateQrInput(maxText, 'L')).toBeNull()
    })
  })

  describe('generateQrDataUrl', () => {
    it('produces a valid PNG data URL for simple text', async () => {
      const dataUrl = await generateQrDataUrl('hello world', { size: 128, ecLevel: 'M' })
      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
      expect(dataUrl.length).toBeGreaterThan(100)
    })

    it('produces different data URLs for different EC levels', async () => {
      const [l, h] = await Promise.all([
        generateQrDataUrl('test', { size: 128, ecLevel: 'L' }),
        generateQrDataUrl('test', { size: 128, ecLevel: 'H' }),
      ])
      expect(l).not.toBe(h)
    })

    it('respects size option', async () => {
      const [small, large] = await Promise.all([
        generateQrDataUrl('test', { size: 128, ecLevel: 'M' }),
        generateQrDataUrl('test', { size: 512, ecLevel: 'M' }),
      ])
      expect(large.length).toBeGreaterThan(small.length)
    })
  })

  describe('generateQrSvg', () => {
    it('produces a valid SVG string', async () => {
      const svg = await generateQrSvg('hello world', { ecLevel: 'M' })
      expect(svg).toContain('<svg')
      expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(svg).toContain('</svg>')
    })

    it('produces different SVGs for different EC levels', async () => {
      const [l, h] = await Promise.all([
        generateQrSvg('test', { ecLevel: 'L' }),
        generateQrSvg('test', { ecLevel: 'H' }),
      ])
      expect(l).not.toBe(h)
    })
  })
})