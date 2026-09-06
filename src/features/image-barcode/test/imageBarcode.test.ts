import { describe, expect, it } from 'vitest'
import { BARCODE_FORMATS } from '../types'
import { formatBytes } from '../lib/imageBarcode'

describe('BARCODE_FORMATS', () => {
  it('has 7 formats', () => { expect(BARCODE_FORMATS).toHaveLength(7) })
  it('includes CODE128', () => { expect(BARCODE_FORMATS.find((f) => f.value === 'CODE128')).toBeDefined() })
  it('includes EAN13', () => { expect(BARCODE_FORMATS.find((f) => f.value === 'EAN13')).toBeDefined() })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})
