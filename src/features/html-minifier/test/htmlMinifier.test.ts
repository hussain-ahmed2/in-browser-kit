import { describe, expect, it } from 'vitest'
import { minifyHtml, compareSizes } from '../lib/htmlMinifier'

describe('HTML Minifier', () => {
  describe('minifyHtml', () => {
    it('removes HTML comments', () => {
      const input = '<!-- comment --><div>Hello</div>'
      const result = minifyHtml(input)
      expect(result).not.toContain('<!--')
      expect(result).not.toContain('comment')
      expect(result).toContain('<div>Hello</div>')
    })

    it('collapses whitespace', () => {
      const input = '<div>\n  <p>Hello</p>\n</div>'
      const result = minifyHtml(input)
      expect(result).toContain('<div><p>Hello</p></div>')
    })

    it('handles empty input', () => {
      expect(minifyHtml('')).toBe('')
    })

    it('preserves conditional comments', () => {
      const input = '<!--[if IE]><p>IE only</p><![endif]-->'
      const result = minifyHtml(input)
      expect(result).toContain('<!--[if IE]')
    })

    it('removes empty attributes', () => {
      const input = '<div class="" id="test">Hello</div>'
      const result = minifyHtml(input)
      expect(result).not.toContain('class=""')
      expect(result).toContain('id="test"')
    })
  })

  describe('compareSizes', () => {
    it('calculates size difference', () => {
      const comparison = compareSizes('<div>Hello</div>', '<div>Hello</div>')
      expect(comparison.original).toBeGreaterThan(0)
      expect(comparison.result).toBeGreaterThan(0)
    })

    it('handles zero original size', () => {
      const comparison = compareSizes('', '')
      expect(comparison.savedPercent).toBe(0)
    })
  })
})
