import { describe, expect, it } from 'vitest'
import { buildAtempoFilter, getSpeedArgs } from '../lib/audioSpeed'

describe('Audio Speed', () => {
  describe('buildAtempoFilter', () => {
    it('returns single atempo for normal range', () => {
      expect(buildAtempoFilter(1)).toBe('atempo=1')
      expect(buildAtempoFilter(0.5)).toBe('atempo=0.5')
      expect(buildAtempoFilter(2.0)).toBe('atempo=2')
    })

    it('chains atempo filters for speed > 2.0', () => {
      const filter = buildAtempoFilter(4.0)
      expect(filter).toContain('atempo=2.0')
      // 4.0 = 2.0 * 2.0
      const parts = filter.split(',')
      expect(parts.length).toBe(2)
    })

    it('chains atempo filters for speed < 0.5', () => {
      const filter = buildAtempoFilter(0.25)
      expect(filter).toContain('atempo=0.5')
    })
  })

  describe('getSpeedArgs', () => {
    it('generates correct FFmpeg args', () => {
      const args = getSpeedArgs(1.5, 'input.mp3', 'output.mp3')
      expect(args).toContain('-i')
      expect(args).toContain('input.mp3')
      expect(args).toContain('-filter:a')
      expect(args).toContain('output.mp3')
    })
  })
})
