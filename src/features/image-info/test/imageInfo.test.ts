import { describe, expect, it } from 'vitest'
import {
  formatBytes,
  formatAspectRatio,
  formatExposureTime,
  formatFNumber,
  formatFocalLength,
} from '../lib/imageInfo'

describe('formatBytes', () => {
  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 B')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1048576)).toBe('1 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1073741824)).toBe('1 GB')
  })
})

describe('formatAspectRatio', () => {
  it('formats 1:1 square', () => {
    expect(formatAspectRatio(100, 100)).toBe('1:1')
  })

  it('formats 16:9 widescreen', () => {
    expect(formatAspectRatio(1920, 1080)).toBe('16:9')
  })

  it('formats 4:3 standard', () => {
    expect(formatAspectRatio(800, 600)).toBe('4:3')
  })

  it('formats 3:2 DSLR', () => {
    expect(formatAspectRatio(3000, 2000)).toBe('3:2')
  })

  it('formats 9:16 portrait', () => {
    expect(formatAspectRatio(1080, 1920)).toBe('9:16')
  })

  it('formats non-standard ratios using GCD', () => {
    expect(formatAspectRatio(640, 480)).toBe('4:3')
  })

  it('handles prime dimensions', () => {
    expect(formatAspectRatio(101, 103)).toBe('101:103')
  })
})

describe('formatExposureTime', () => {
  it('formats exposure of 1 second or more', () => {
    expect(formatExposureTime(1)).toBe('1s')
    expect(formatExposureTime(2)).toBe('2s')
  })

  it('formats fast shutter speeds as fractions', () => {
    expect(formatExposureTime(0.001)).toBe('1/1000s')
    expect(formatExposureTime(0.0005)).toBe('1/2000s')
  })

  it('formats 1/60s', () => {
    expect(formatExposureTime(1 / 60)).toBe('1/60s')
  })

  it('formats 1/125s', () => {
    expect(formatExposureTime(1 / 125)).toBe('1/125s')
  })
})

describe('formatFNumber', () => {
  it('formats f/1.4', () => {
    expect(formatFNumber(1.4)).toBe('f/1.4')
  })

  it('formats f/2.8', () => {
    expect(formatFNumber(2.8)).toBe('f/2.8')
  })

  it('formats f/5.6', () => {
    expect(formatFNumber(5.6)).toBe('f/5.6')
  })

  it('formats f/22', () => {
    expect(formatFNumber(22)).toBe('f/22.0')
  })
})

describe('formatFocalLength', () => {
  it('formats 50mm', () => {
    expect(formatFocalLength(50)).toBe('50mm')
  })

  it('formats 24mm wide angle', () => {
    expect(formatFocalLength(24)).toBe('24mm')
  })

  it('formats 200mm telephoto', () => {
    expect(formatFocalLength(200)).toBe('200mm')
  })
})
