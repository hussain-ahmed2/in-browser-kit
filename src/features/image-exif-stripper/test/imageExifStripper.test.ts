import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/imageExifStripper'

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})
