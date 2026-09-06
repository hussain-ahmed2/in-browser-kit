import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/imageCssSprite'

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})

describe('createSprite', () => {
  it('throws for empty files', async () => {
    const { createSprite } = await import('../lib/imageCssSprite')
    await expect(createSprite([], { gap: 0, layout: 'auto' })).rejects.toThrow('No images provided')
  })
})
