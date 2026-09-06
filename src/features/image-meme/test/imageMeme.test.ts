import { describe, expect, it } from 'vitest'
import { MEME_FONTS } from '../types'
import { formatBytes } from '../lib/imageMeme'

describe('MEME_FONTS', () => {
  it('has 6 fonts', () => { expect(MEME_FONTS).toHaveLength(6) })
  it('includes Impact', () => { expect(MEME_FONTS).toContain('Impact') })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})
