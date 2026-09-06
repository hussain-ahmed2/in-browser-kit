import { describe, expect, it } from 'vitest'
import {
  constrainCropArea,
  ASPECT_RATIOS,
  type CropArea,
} from '../lib/imageCrop'

describe('ASPECT_RATIOS', () => {
  it('has free as null', () => {
    expect(ASPECT_RATIOS.free).toBeNull()
  })

  it('has correct 1:1 ratio', () => {
    expect(ASPECT_RATIOS['1:1']).toBe(1)
  })

  it('has correct 16:9 ratio', () => {
    expect(ASPECT_RATIOS['16:9']).toBeCloseTo(16 / 9)
  })

  it('has correct 4:3 ratio', () => {
    expect(ASPECT_RATIOS['4:3']).toBeCloseTo(4 / 3)
  })

  it('has correct 9:16 portrait ratio', () => {
    expect(ASPECT_RATIOS['9:16']).toBeCloseTo(9 / 16)
  })
})

describe('constrainCropArea', () => {
  it('clamps area to image bounds', () => {
    const area: CropArea = { x: -10, y: -5, width: 200, height: 200 }
    const result = constrainCropArea(area, 100, 100, null)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
    expect(result.width).toBe(100)
    expect(result.height).toBe(100)
  })

  it('clamps area exceeding right edge', () => {
    const area: CropArea = { x: 80, y: 0, width: 50, height: 50 }
    const result = constrainCropArea(area, 100, 100, null)
    expect(result.x).toBe(50)
    expect(result.width).toBe(50)
  })

  it('clamps area exceeding bottom edge', () => {
    const area: CropArea = { x: 0, y: 80, width: 50, height: 50 }
    const result = constrainCropArea(area, 100, 100, null)
    expect(result.y).toBe(50)
    expect(result.height).toBe(50)
  })

  it('enforces 1:1 aspect ratio on wide area', () => {
    const area: CropArea = { x: 0, y: 0, width: 200, height: 100 }
    const result = constrainCropArea(area, 300, 300, 1)
    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })

  it('enforces 1:1 aspect ratio on tall area', () => {
    const area: CropArea = { x: 0, y: 0, width: 100, height: 200 }
    const result = constrainCropArea(area, 300, 300, 1)
    expect(result.width).toBe(200)
    expect(result.height).toBe(200)
  })

  it('enforces 16:9 aspect ratio', () => {
    const area: CropArea = { x: 0, y: 0, width: 320, height: 200 }
    const result = constrainCropArea(area, 400, 400, 16 / 9)
    expect(result.width / result.height).toBeCloseTo(16 / 9)
  })

  it('clamps wide aspect ratio crop to image bounds', () => {
    // 16:9 on a square image — width should be clamped by image width
    const area: CropArea = { x: 0, y: 0, width: 500, height: 300 }
    const result = constrainCropArea(area, 200, 200, 16 / 9)
    expect(result.width).toBeLessThanOrEqual(200)
    expect(result.height).toBeLessThanOrEqual(200)
    expect(result.width / result.height).toBeCloseTo(16 / 9)
  })

  it('clamps tall aspect ratio crop to image bounds', () => {
    // 9:16 on a square image — height should be clamped by image height
    const area: CropArea = { x: 0, y: 0, width: 100, height: 300 }
    const result = constrainCropArea(area, 200, 200, 9 / 16)
    expect(result.width).toBeLessThanOrEqual(200)
    expect(result.height).toBeLessThanOrEqual(200)
    expect(result.width / result.height).toBeCloseTo(9 / 16)
  })

  it('preserves valid free-form area', () => {
    const area: CropArea = { x: 10, y: 20, width: 150, height: 80 }
    const result = constrainCropArea(area, 300, 300, null)
    expect(result).toEqual(area)
  })

  it('handles zero-size area', () => {
    const area: CropArea = { x: 50, y: 50, width: 0, height: 0 }
    const result = constrainCropArea(area, 100, 100, null)
    expect(result.width).toBe(0)
    expect(result.height).toBe(0)
  })
})
