import { describe, expect, it } from 'vitest'
import { minifyCss, beautifyCss, compareSizes } from '../lib/cssMinifier'

describe('CSS Minifier', () => {
  describe('minifyCss', () => {
    it('removes comments', () => {
      const input = '/* comment */ .a { color: red; }'
      const result = minifyCss(input)
      expect(result).not.toContain('/*')
      expect(result).not.toContain('comment')
    })

    it('removes whitespace', () => {
      const input = '.a {\n  color: red;\n}'
      const result = minifyCss(input)
      expect(result).toContain('.a{color:red}')
    })

    it('handles empty input', () => {
      expect(minifyCss('')).toBe('')
    })

    it('minifies multiple rules', () => {
      const input = '.a { color: red; } .b { color: blue; }'
      const result = minifyCss(input)
      expect(result).toContain('.a{color:red}')
      expect(result).toContain('.b{color:blue}')
    })
  })

  describe('beautifyCss', () => {
    it('adds indentation', () => {
      const input = '.a{color:red}'
      const result = beautifyCss(input)
      expect(result).toContain('.a')
      expect(result).toContain('color: red')
    })

    it('handles empty input', () => {
      expect(beautifyCss('')).toBe('')
    })

    it('handles multiple rules', () => {
      const input = '.a{color:red}.b{color:blue}'
      const result = beautifyCss(input)
      expect(result).toContain('.a')
      expect(result).toContain('.b')
    })
  })

  describe('compareSizes', () => {
    it('calculates size difference', () => {
      const comparison = compareSizes('.a { color: red; }', '.a{color:red}')
      expect(comparison.original).toBeGreaterThan(0)
      expect(comparison.result).toBeGreaterThan(0)
      expect(comparison.saved).toBeGreaterThanOrEqual(0)
    })

    it('handles zero original size', () => {
      const comparison = compareSizes('', '')
      expect(comparison.savedPercent).toBe(0)
    })
  })
})
