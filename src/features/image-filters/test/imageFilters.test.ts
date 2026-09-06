import { describe, expect, it } from 'vitest'
import { DEFAULT_FILTERS, getFilterCSS, type FilterValues } from '../lib/imageFilters'

describe('DEFAULT_FILTERS', () => {
  it('has brightness at 0', () => {
    expect(DEFAULT_FILTERS.brightness).toBe(0)
  })

  it('has contrast at 0', () => {
    expect(DEFAULT_FILTERS.contrast).toBe(0)
  })

  it('has saturation at 100', () => {
    expect(DEFAULT_FILTERS.saturation).toBe(100)
  })

  it('has all other filters at 0', () => {
    expect(DEFAULT_FILTERS.blur).toBe(0)
    expect(DEFAULT_FILTERS.grayscale).toBe(0)
    expect(DEFAULT_FILTERS.sepia).toBe(0)
    expect(DEFAULT_FILTERS.hueRotate).toBe(0)
    expect(DEFAULT_FILTERS.invert).toBe(0)
  })
})

describe('getFilterCSS', () => {
  it('returns "none" for default filters', () => {
    expect(getFilterCSS(DEFAULT_FILTERS)).toBe('none')
  })

  it('generates brightness filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, brightness: 25 }
    expect(getFilterCSS(filters)).toBe('brightness(125%)')
  })

  it('generates negative brightness filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, brightness: -50 }
    expect(getFilterCSS(filters)).toBe('brightness(50%)')
  })

  it('generates contrast filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, contrast: 30 }
    expect(getFilterCSS(filters)).toBe('contrast(130%)')
  })

  it('generates saturation filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, saturation: 0 }
    expect(getFilterCSS(filters)).toBe('saturate(0%)')
  })

  it('generates blur filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, blur: 5 }
    expect(getFilterCSS(filters)).toBe('blur(5px)')
  })

  it('ignores blur when 0', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, blur: 0 }
    expect(getFilterCSS(filters)).toBe('none')
  })

  it('generates grayscale filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, grayscale: 100 }
    expect(getFilterCSS(filters)).toBe('grayscale(100%)')
  })

  it('generates sepia filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, sepia: 80 }
    expect(getFilterCSS(filters)).toBe('sepia(80%)')
  })

  it('generates hue-rotate filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, hueRotate: 180 }
    expect(getFilterCSS(filters)).toBe('hue-rotate(180deg)')
  })

  it('generates invert filter', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, invert: 100 }
    expect(getFilterCSS(filters)).toBe('invert(100%)')
  })

  it('combines multiple filters', () => {
    const filters: FilterValues = {
      ...DEFAULT_FILTERS,
      brightness: 10,
      contrast: 20,
      grayscale: 50,
    }
    const result = getFilterCSS(filters)
    expect(result).toContain('brightness(110%)')
    expect(result).toContain('contrast(120%)')
    expect(result).toContain('grayscale(50%)')
  })

  it('skips filters at their default values', () => {
    const filters: FilterValues = { ...DEFAULT_FILTERS, brightness: 10 }
    const result = getFilterCSS(filters)
    expect(result).not.toContain('contrast')
    expect(result).not.toContain('blur')
    expect(result).not.toContain('grayscale')
  })
})
