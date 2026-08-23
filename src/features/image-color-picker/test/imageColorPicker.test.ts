import { describe, expect, it } from 'vitest'
import {
  getPixelColor,
  formatRgb,
  formatHsl,
} from '../lib/imageColorPicker'

function makeImageData(pixels: number[]): ImageData {
  const data = new Uint8ClampedArray(pixels)
  return { data, width: 1, height: 1, colorSpace: 'srgb' } as ImageData
}

describe('getPixelColor', () => {
  it('reads pure red pixel', () => {
    const img = makeImageData([255, 0, 0, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.rgb).toEqual({ r: 255, g: 0, b: 0 })
    expect(color.hex).toBe('#ff0000')
    expect(color.alpha).toBe(1)
  })

  it('reads pure green pixel', () => {
    const img = makeImageData([0, 255, 0, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.rgb).toEqual({ r: 0, g: 255, b: 0 })
    expect(color.hex).toBe('#00ff00')
  })

  it('reads pure blue pixel', () => {
    const img = makeImageData([0, 0, 255, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.rgb).toEqual({ r: 0, g: 0, b: 255 })
    expect(color.hex).toBe('#0000ff')
  })

  it('reads semi-transparent pixel', () => {
    const img = makeImageData([128, 64, 32, 128])
    const color = getPixelColor(img, 0, 0)
    expect(color.rgb).toEqual({ r: 128, g: 64, b: 32 })
    expect(color.alpha).toBe(0.5)
  })

  it('reads black pixel', () => {
    const img = makeImageData([0, 0, 0, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.hex).toBe('#000000')
    expect(color.hsl).toEqual({ h: 0, s: 0, l: 0 })
  })

  it('reads white pixel', () => {
    const img = makeImageData([255, 255, 255, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.hex).toBe('#ffffff')
    expect(color.hsl).toEqual({ h: 0, s: 0, l: 100 })
  })

  it('converts gray pixel to correct HSL', () => {
    const img = makeImageData([128, 128, 128, 255])
    const color = getPixelColor(img, 0, 0)
    expect(color.hsl.s).toBe(0)
    expect(color.hsl.l).toBe(50)
  })
})

describe('formatRgb', () => {
  it('formats rgb string', () => {
    expect(formatRgb({ r: 255, g: 128, b: 0 })).toBe('rgb(255, 128, 0)')
  })

  it('formats black', () => {
    expect(formatRgb({ r: 0, g: 0, b: 0 })).toBe('rgb(0, 0, 0)')
  })
})

describe('formatHsl', () => {
  it('formats hsl string', () => {
    expect(formatHsl({ h: 180, s: 50, l: 75 })).toBe('hsl(180, 50%, 75%)')
  })

  it('formats achromatic', () => {
    expect(formatHsl({ h: 0, s: 0, l: 50 })).toBe('hsl(0, 0%, 50%)')
  })
})
