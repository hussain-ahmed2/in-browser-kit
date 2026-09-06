import { describe, expect, it } from 'vitest'
import { ASCII_CHARSETS } from '../types'
import { formatBytes } from '../lib/imageAscii'

describe('ASCII_CHARSETS', () => {
  it('has 5 charsets', () => { expect(ASCII_CHARSETS).toHaveLength(5) })
  it('includes Simple', () => { expect(ASCII_CHARSETS.find((c) => c.value === ' .:-=+*#%@')).toBeDefined() })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
})
