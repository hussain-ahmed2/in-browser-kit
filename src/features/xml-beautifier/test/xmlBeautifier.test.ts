import { describe, expect, it } from 'vitest'
import { formatXml, validateXml } from '../lib/xmlBeautifier'

describe('XML Beautifier', () => {
  describe('formatXml', () => {
    it('formats simple XML', () => {
      const input = '<root><item>hello</item></root>'
      const result = formatXml(input, 2)
      expect(result).toContain('<root>')
      expect(result).toContain('<item>')
      expect(result).toContain('hello')
      expect(result).toContain('</item>')
      expect(result).toContain('</root>')
    })

    it('handles attributes', () => {
      const input = '<root attr="val"><item/></root>'
      const result = formatXml(input, 2)
      expect(result).toContain('attr="val"')
    })

    it('handles self-closing tags', () => {
      const input = '<root><br/></root>'
      const result = formatXml(input, 2)
      expect(result).toContain('<br/>')
    })

    it('handles processing instructions', () => {
      const input = '<?xml version="1.0"?><root/>'
      const result = formatXml(input, 2)
      expect(result).toContain('<?xml')
    })

    it('returns empty string for empty input', () => {
      expect(formatXml('', 2)).toBe('')
    })

    it('respects indent size', () => {
      const input = '<root><item/></root>'
      const result2 = formatXml(input, 2)
      const result4 = formatXml(input, 4)
      expect(result4.length).toBeGreaterThanOrEqual(result2.length)
    })
  })

  describe('validateXml', () => {
    it('validates correct XML', () => {
      const result = validateXml('<root><item>hello</item></root>')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('rejects invalid XML', () => {
      const result = validateXml('<root><unclosed></root>')
      expect(result.valid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error for empty input', () => {
      const result = validateXml('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Empty input')
    })

    it('validates XML with attributes', () => {
      const result = validateXml('<root attr="val"><item/></root>')
      expect(result.valid).toBe(true)
    })
  })
})
