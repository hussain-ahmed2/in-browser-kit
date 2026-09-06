import { describe, expect, it } from 'vitest'
import { minifyJs, compareSizes } from '../lib/jsMinifier'

describe('JS Minifier', () => {
  describe('minifyJs', () => {
    it('removes single-line comments', () => {
      const input = 'var x = 1; // this is a comment\nvar y = 2;'
      const result = minifyJs(input)
      expect(result).not.toContain('// this is a comment')
      expect(result).toContain('var')
    })

    it('removes multi-line comments', () => {
      const input = '/* multi\nline\ncomment */ var x = 1;'
      const result = minifyJs(input)
      expect(result).not.toContain('multi')
      expect(result).toContain('var')
    })

    it('handles empty input', () => {
      expect(minifyJs('')).toBe('')
    })

    it('collapses whitespace', () => {
      const input = 'var   x   =   1;'
      const result = minifyJs(input)
      expect(result.length).toBeLessThan(input.length)
    })
  })

  describe('compareSizes', () => {
    it('calculates size difference', () => {
      const comparison = compareSizes('var x = 1;', 'var x=1;')
      expect(comparison.original).toBeGreaterThan(0)
      expect(comparison.savedPercent).toBeGreaterThanOrEqual(0)
    })
  })
})
