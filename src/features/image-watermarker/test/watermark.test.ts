import { describe, expect, it } from 'vitest'
import {
  POSITION_PRESETS,
  clamp,
  resolvePresetCenter,
  computeRotatedBounds,
  deriveOutputName,
  resolveExportMime,
  buildFontSpec,
} from '../lib/watermark'

describe('PositionPresets', () => {
  it('lists 9 preset values', () => {
    expect(POSITION_PRESETS).toHaveLength(9)
  })
})

describe('clamp', () => {
  it('clamps value within range', () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(15, 1, 10)).toBe(10)
    expect(clamp(-3, 1, 10)).toBe(1)
  })
})

describe('computeRotatedBounds', () => {
  it('computes 0-degree bounds', () => {
    expect(computeRotatedBounds(100, 50, 0)).toEqual({ width: 100, height: 50 })
  })

  it('computes 90-degree bounds', () => {
    expect(computeRotatedBounds(100, 50, 90)).toEqual({ width: 50, height: 100 })
  })

  it('computes 45-degree bounds', () => {
    const result = computeRotatedBounds(100, 50, 45)
    expect(result.width).toBeGreaterThan(100)
    expect(result.height).toBeGreaterThan(50)
  })
})

describe('deriveOutputName', () => {
  it('maps jpeg extension', () => {
    expect(deriveOutputName('photo.jpg', 'image/jpeg')).toBe('photo.jpg')
  })

  it('maps png extension', () => {
    expect(deriveOutputName('photo.png', 'image/png')).toBe('photo.png')
  })

  it('maps webp extension', () => {
    expect(deriveOutputName('photo.jpg', 'image/webp')).toBe('photo.webp')
  })

  it('keeps original name for keep format', () => {
    expect(deriveOutputName('scan.png', 'keep')).toBe('scan.png')
  })

  it('falls back to image when name has no extension', () => {
    expect(deriveOutputName('scan', 'image/png')).toBe('scan.png')
  })
})

describe('resolveExportMime', () => {
  it('returns format when not keep', () => {
    expect(resolveExportMime('image/jpeg', 'image/png')).toBe('image/jpeg')
  })

  it('returns source type for keep when supported', () => {
    expect(resolveExportMime('keep', 'image/png')).toBe('image/png')
    expect(resolveExportMime('keep', 'image/jpeg')).toBe('image/jpeg')
    expect(resolveExportMime('keep', 'image/webp')).toBe('image/webp')
  })

  it('returns png for keep when source unsupported', () => {
    expect(resolveExportMime('keep', 'image/gif')).toBe('image/png')
    expect(resolveExportMime('keep', 'image/bmp')).toBe('image/png')
  })
})

describe('buildFontSpec', () => {
  it('builds normal font', () => {
    expect(buildFontSpec(24, false)).toBe('24px system-ui, sans-serif')
  })

  it('builds bold font', () => {
    expect(buildFontSpec(24, true)).toBe('bold 24px system-ui, sans-serif')
  })
})

describe('resolvePresetCenter', () => {
  it('positions top-left with explicit dimensions', () => {
    const { x, y } = resolvePresetCenter('top-left', 400, 300, 60, 40, 8)
    expect(x).toBeCloseTo(8 + 30, 1)
    expect(y).toBeCloseTo(8 + 20, 1)
  })

  it('positions center', () => {
    const { x, y } = resolvePresetCenter('center', 400, 300, 60, 40, 8)
    expect(x).toBeCloseTo(200, 1)
    expect(y).toBeCloseTo(150, 1)
  })

  it('positions bottom-right with explicit dimensions', () => {
    const { x, y } = resolvePresetCenter('bottom-right', 400, 300, 60, 40, 8)
    expect(x).toBeCloseTo(400 - 8 - 30, 1)
    expect(y).toBeCloseTo(300 - 8 - 20, 1)
  })

it('clamps when watermark larger than image area', () => {
    const { x, y } = resolvePresetCenter('top-left', 200, 200, 300, 300, 10)
    // minX = 10+150=160, maxX = 200-150=40 => minX>maxX; clamp returns maxX=40
    expect(x).toBeCloseTo(40, 1)
    expect(y).toBeCloseTo(40, 1)
  })
})