import { describe, expect, it } from 'vitest'
import { formatDuration, formatBytes } from '../lib/audioRecorder'

describe('formatDuration', () => {
  it('formats 0 seconds', () => { expect(formatDuration(0)).toBe('0:00') })
  it('formats seconds', () => { expect(formatDuration(45)).toBe('0:45') })
  it('formats minutes and seconds', () => { expect(formatDuration(125)).toBe('2:05') })
  it('formats exactly one minute', () => { expect(formatDuration(60)).toBe('1:00') })
})

describe('formatBytes', () => {
  it('formats 0 bytes', () => { expect(formatBytes(0)).toBe('0 B') })
  it('formats kilobytes', () => { expect(formatBytes(1024)).toBe('1 KB') })
  it('formats megabytes', () => { expect(formatBytes(1048576)).toBe('1 MB') })
})
