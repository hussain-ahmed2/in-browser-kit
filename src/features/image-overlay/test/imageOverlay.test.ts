import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/imageOverlay'
import { BLEND_MODES, POSITION_OPTIONS } from '../types'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })
})

describe('BLEND_MODES', () => {
  it('has 12 blend modes', () => {
    expect(BLEND_MODES).toHaveLength(12)
  })
  it('includes source-over', () => {
    expect(BLEND_MODES.find((m) => m.value === 'source-over')).toBeDefined()
  })
  it('includes multiply', () => {
    expect(BLEND_MODES.find((m) => m.value === 'multiply')).toBeDefined()
  })
  it('has unique values', () => {
    const values = BLEND_MODES.map((m) => m.value)
    expect(new Set(values).size).toBe(values.length)
  })
})

describe('POSITION_OPTIONS', () => {
  it('has 6 positions', () => {
    expect(POSITION_OPTIONS).toHaveLength(6)
  })
  it('includes center', () => {
    expect(POSITION_OPTIONS.find((p) => p.value === 'center')).toBeDefined()
  })
  it('includes tile', () => {
    expect(POSITION_OPTIONS.find((p) => p.value === 'tile')).toBeDefined()
  })
})
