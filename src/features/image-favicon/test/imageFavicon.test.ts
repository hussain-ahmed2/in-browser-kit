import { describe, expect, it } from 'vitest'
import { FAVICON_SIZES, formatBytes, type FaviconSize } from '../lib/imageFavicon'

describe('FAVICON_SIZES', () => {
  it('has 10 favicon sizes', () => {
    expect(FAVICON_SIZES).toHaveLength(10)
  })

  it('includes standard favicon sizes', () => {
    const faviconSizes = FAVICON_SIZES.filter((s) => s.category === 'favicon')
    expect(faviconSizes).toHaveLength(7)
    expect(faviconSizes.map((s) => s.width)).toEqual([16, 32, 48, 64, 128, 256, 512])
  })

  it('includes Apple touch icon', () => {
    const appleSizes = FAVICON_SIZES.filter((s) => s.category === 'apple')
    expect(appleSizes).toHaveLength(1)
    expect(appleSizes[0].width).toBe(180)
  })

  it('includes Android icons', () => {
    const androidSizes = FAVICON_SIZES.filter((s) => s.category === 'android')
    expect(androidSizes).toHaveLength(2)
    expect(androidSizes.map((s) => s.width)).toEqual([192, 512])
  })

  it('every size has a unique id', () => {
    const ids = FAVICON_SIZES.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every size has width equal to height', () => {
    FAVICON_SIZES.forEach((size) => {
      expect(size.width).toBe(size.height)
    })
  })

  it('every size has a non-empty label', () => {
    FAVICON_SIZES.forEach((size) => {
      expect(size.label.length).toBeGreaterThan(0)
    })
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
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })
})

describe('FaviconSize type', () => {
  it('accepts valid category values', () => {
    const categories: FaviconSize['category'][] = ['favicon', 'apple', 'android']
    expect(categories).toHaveLength(3)
  })
})
