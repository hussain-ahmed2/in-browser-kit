import { describe, expect, it } from 'vitest'
import { formatBytes } from '../lib/backgroundRemover'

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
  it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB') })
  it('formats gigabytes', () => { expect(formatBytes(1073741824)).toBe('1 GB') })
})
