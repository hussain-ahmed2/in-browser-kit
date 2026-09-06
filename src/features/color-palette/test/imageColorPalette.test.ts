import { describe, expect, it } from 'vitest'
import { formatBytes, rgbToHex, rgbToHsl } from '../lib/imageColorPalette'
import { colorPaletteSchema } from '../types'

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

describe('rgbToHex', () => {
  it('converts black', () => {
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
  })

  it('converts white', () => {
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('converts red', () => {
    expect(rgbToHex(255, 0, 0)).toBe('#ff0000')
  })

  it('converts green', () => {
    expect(rgbToHex(0, 128, 0)).toBe('#008000')
  })

  it('converts blue', () => {
    expect(rgbToHex(0, 0, 255)).toBe('#0000ff')
  })

  it('converts a mid-range color', () => {
    expect(rgbToHex(128, 64, 192)).toBe('#8040c0')
  })
})

describe('rgbToHsl', () => {
  it('converts black to hsl', () => {
    const hsl = rgbToHsl(0, 0, 0)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(0)
  })

  it('converts white to hsl', () => {
    const hsl = rgbToHsl(255, 255, 255)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(100)
  })

  it('converts pure red', () => {
    const hsl = rgbToHsl(255, 0, 0)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts pure green', () => {
    const hsl = rgbToHsl(0, 255, 0)
    expect(hsl.h).toBe(120)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts pure blue', () => {
    const hsl = rgbToHsl(0, 0, 255)
    expect(hsl.h).toBe(240)
    expect(hsl.s).toBe(100)
    expect(hsl.l).toBe(50)
  })

  it('converts a gray tone', () => {
    const hsl = rgbToHsl(128, 128, 128)
    expect(hsl.h).toBe(0)
    expect(hsl.s).toBe(0)
    expect(hsl.l).toBe(50)
  })

  it('converts a mid-range color', () => {
    const hsl = rgbToHsl(128, 64, 192)
    expect(hsl.h).toBe(270)
    expect(hsl.s).toBe(50)
    expect(hsl.l).toBe(50)
  })
})

describe('colorPaletteSchema', () => {
  it('defaults colorCount to 5', () => {
    const result = colorPaletteSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.colorCount).toBe(5)
    }
  })

  it('accepts valid colorCount values', () => {
    expect(colorPaletteSchema.safeParse({ colorCount: 2 }).success).toBe(true)
    expect(colorPaletteSchema.safeParse({ colorCount: 12 }).success).toBe(true)
    expect(colorPaletteSchema.safeParse({ colorCount: 6 }).success).toBe(true)
  })

  it('rejects colorCount below 2', () => {
    expect(colorPaletteSchema.safeParse({ colorCount: 1 }).success).toBe(false)
  })

  it('rejects colorCount above 12', () => {
    expect(colorPaletteSchema.safeParse({ colorCount: 13 }).success).toBe(false)
  })

  it('rejects non-integer colorCount', () => {
    expect(colorPaletteSchema.safeParse({ colorCount: 5.5 }).success).toBe(false)
  })
})
