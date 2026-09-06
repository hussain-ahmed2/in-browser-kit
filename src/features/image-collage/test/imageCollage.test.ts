import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/imageCollage'
import { MIN_IMAGES } from '../types'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })
})

describe('MIN_IMAGES', () => {
  it('grid-2x2 needs at least 2', () => {
    expect(MIN_IMAGES['grid-2x2']).toBe(2)
  })
  it('grid-3x3 needs at least 2', () => {
    expect(MIN_IMAGES['grid-3x3']).toBe(2)
  })
  it('horizontal needs at least 2', () => {
    expect(MIN_IMAGES.horizontal).toBe(2)
  })
  it('mosaic needs at least 3', () => {
    expect(MIN_IMAGES.mosaic).toBe(3)
  })
})
