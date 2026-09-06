import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/imageAnnotate'
import { ANNOTATE_TOOLS } from '../types'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })
  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
  })
})

describe('ANNOTATE_TOOLS', () => {
  it('has 6 tools', () => {
    expect(ANNOTATE_TOOLS).toHaveLength(6)
  })
  it('includes arrow', () => {
    expect(ANNOTATE_TOOLS.find((t) => t.value === 'arrow')).toBeDefined()
  })
  it('includes rectangle', () => {
    expect(ANNOTATE_TOOLS.find((t) => t.value === 'rectangle')).toBeDefined()
  })
  it('includes circle', () => {
    expect(ANNOTATE_TOOLS.find((t) => t.value === 'circle')).toBeDefined()
  })
  it('includes text', () => {
    expect(ANNOTATE_TOOLS.find((t) => t.value === 'text')).toBeDefined()
  })
  it('includes freehand', () => {
    expect(ANNOTATE_TOOLS.find((t) => t.value === 'freehand')).toBeDefined()
  })
  it('has unique values', () => {
    const values = ANNOTATE_TOOLS.map((t) => t.value)
    expect(new Set(values).size).toBe(values.length)
  })
})
