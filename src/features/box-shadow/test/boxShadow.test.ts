import { describe, expect, it } from 'vitest'
import { generateBoxShadow, generateCssBlock } from '../lib/boxShadow'

describe('CSS Box Shadow Generator', () => {
  describe('generateBoxShadow', () => {
    it('generates basic shadow', () => {
      const result = generateBoxShadow(0, 4, 16, 0, '#000000', false)
      expect(result).toBe('0px 4px 16px 0px #000000')
    })

    it('generates inset shadow', () => {
      const result = generateBoxShadow(2, 2, 4, 0, '#ff0000', true)
      expect(result.startsWith('inset ')).toBe(true)
      expect(result).toContain('#ff0000')
    })

    it('handles negative values', () => {
      const result = generateBoxShadow(-5, -5, 10, 0, '#000', false)
      expect(result).toContain('-5px')
    })
  })

  describe('generateCssBlock', () => {
    it('generates CSS block with semicolon', () => {
      const result = generateCssBlock(0, 4, 16, 0, '#000000', false)
      expect(result).toMatch(/^box-shadow: /)
      expect(result).toMatch(/;$/)
    })
  })
})
