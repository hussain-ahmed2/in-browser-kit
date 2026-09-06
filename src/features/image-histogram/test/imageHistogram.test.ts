import { describe, expect, it } from 'vitest'
import { normalizeHistogram, formatBytes } from '../lib/imageHistogram'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })
})

describe('normalizeHistogram', () => {
  it('normalizes to 0-1 range', () => {
    const bins = [0, 50, 100, 25, 75]
    const result = normalizeHistogram(bins)
    expect(result[0]).toBe(0)
    expect(result[2]).toBe(1)
    expect(result[3]).toBeCloseTo(0.25)
  })

  it('returns all zeros for empty bins', () => {
    const bins = [0, 0, 0, 0]
    const result = normalizeHistogram(bins)
    expect(result).toEqual([0, 0, 0, 0])
  })

  it('handles single value', () => {
    const bins = [0, 0, 42, 0]
    const result = normalizeHistogram(bins)
    expect(result[2]).toBe(1)
  })
})
