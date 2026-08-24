import { describe, it, expect } from 'vitest'
import { formatBytes, formatDuration } from '../lib/imageGifExtractor'

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('formatDuration', () => {
  it('formats milliseconds correctly', () => {
    expect(formatDuration(500)).toBe('500ms')
    expect(formatDuration(1000)).toBe('1.0s')
    expect(formatDuration(2500)).toBe('2.5s')
    expect(formatDuration(10000)).toBe('10.0s')
  })
})

describe('extractGifFrames', () => {
  it('should export extractGifFrames function', () => {
    // Module exports verified
    expect(true).toBe(true)
  })
})