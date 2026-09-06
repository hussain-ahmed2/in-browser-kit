import { describe, expect, it } from 'vitest'
import { SOCIAL_PRESETS } from '../types'
import { formatBytes } from '../lib/imageSocialResizer'

describe('SOCIAL_PRESETS', () => {
  it('has 11 presets', () => {
    expect(SOCIAL_PRESETS).toHaveLength(11)
  })
  it('has unique values', () => {
    const values = SOCIAL_PRESETS.map((p) => p.value)
    expect(new Set(values).size).toBe(values.length)
  })
  it('Instagram Post is 1080x1080', () => {
    const preset = SOCIAL_PRESETS.find((p) => p.value === 'instagram-post')
    expect(preset?.width).toBe(1080)
    expect(preset?.height).toBe(1080)
  })
  it('YouTube Thumbnail is 1280x720', () => {
    const preset = SOCIAL_PRESETS.find((p) => p.value === 'youtube-thumbnail')
    expect(preset?.width).toBe(1280)
    expect(preset?.height).toBe(720)
  })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
  it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB') })
})
