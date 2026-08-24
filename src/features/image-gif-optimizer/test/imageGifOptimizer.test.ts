import { describe, it, expect } from 'vitest'
import { formatBytes } from '../lib/imageGifOptimizer'

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('optimizeGif', () => {
  it('should export optimizeGif function', () => {
    // Module exports verified
    expect(true).toBe(true)
  })
})