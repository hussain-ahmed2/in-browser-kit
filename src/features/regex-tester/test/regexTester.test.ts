import { describe, expect, it } from 'vitest'
import {
  testRegex,
  replaceRegex,
  escapeRegex,
  FLAG_DESCRIPTIONS,
  FLAG_OPTIONS,
  CHEATSHEET,
} from '../lib/regexTester'

describe('Regex Tester', () => {
  describe('testRegex', () => {
    it('finds simple match', () => {
      const result = testRegex('hello', '', 'hello world')
      expect(result.error).toBeNull()
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].match).toBe('hello')
      expect(result.matches[0].index).toBe(0)
    })

    it('finds all matches with global flag', () => {
      const result = testRegex('l', 'g', 'hello world')
      expect(result.matches).toHaveLength(3)
      expect(result.matches.map(m => m.index)).toEqual([2, 3, 9])
    })

    it('handles case insensitive flag', () => {
      const result = testRegex('HELLO', 'i', 'hello world')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].match).toBe('hello')
    })

    it('handles multiline flag', () => {
      const result = testRegex('^hello', 'm', 'world\nhello')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].index).toBe(6)
    })

    it('handles dotall flag', () => {
      const result = testRegex('.', 'sg', 'hello\nworld')
      expect(result.matches).toHaveLength(11)
    })

    it('captures groups', () => {
      const result = testRegex('(\\d{4})-(\\d{2})-(\\d{2})', '', '2024-01-15')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].groups).toEqual({})
      // Note: unnamed groups are not in groups object in JS
    })

    it('handles named groups', () => {
      const result = testRegex('(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', '', '2024-01-15')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].groups).toEqual({
        year: '2024',
        month: '01',
        day: '15',
      })
    })

    it('returns indices', () => {
      const result = testRegex('world', '', 'hello world')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].indices).toEqual([[6, 11]])
    })

    it('returns error for invalid regex', () => {
      const result = testRegex('[', '', 'test')
      expect(result.error).not.toBeNull()
      expect(result.matches).toHaveLength(0)
    })

    it('handles empty pattern', () => {
      const result = testRegex('', '', 'test')
      expect(result.error).toBeNull()
      expect(result.matches).toHaveLength(0)
    })

    it('detects full match', () => {
      const result = testRegex('hello', '', 'hello')
      expect(result.fullMatch).toBe(true)
    })

    it('detects partial match', () => {
      const result = testRegex('hello', '', 'hello world')
      expect(result.fullMatch).toBe(false)
    })

    it('handles unicode flag', () => {
      const result = testRegex('😀', 'u', 'hello 😀 world')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].match).toBe('😀')
    })

    it('handles sticky flag', () => {
      const result = testRegex('hello', 'y', 'hello world')
      expect(result.matches).toHaveLength(1)
      expect(result.matches[0].index).toBe(0)
    })

    it('sticky flag fails when not at lastIndex', () => {
      const regex = new RegExp('world', 'y')
      regex.lastIndex = 0
      const result = regex.exec('hello world')
      expect(result).toBeNull()
    })
  })

  describe('replaceRegex', () => {
    it('replaces first match by default', () => {
      const result = replaceRegex('l', '', 'hello world', 'X')
      expect(result).toBe('heXlo world')
    })

    it('replaces all with global flag', () => {
      const result = replaceRegex('l', 'g', 'hello world', 'X')
      expect(result).toBe('heXXo worXd')
    })

    it('uses capture groups in replacement', () => {
      const result = replaceRegex('(\\d+)-(\\d+)', '', '2024-01', '$2/$1')
      expect(result).toBe('01/2024')
    })

    it('handles empty pattern', () => {
      const result = replaceRegex('', '', 'test', 'X')
      expect(result).toBe('test')
    })

    it('handles invalid regex', () => {
      const result = replaceRegex('[', '', 'test', 'X')
      expect(result).toBe('test')
    })
  })

  describe('escapeRegex', () => {
    it('escapes special characters', () => {
      expect(escapeRegex('hello.world')).toBe('hello\\.world')
      expect(escapeRegex('(test)')).toBe('\\(test\\)')
      expect(escapeRegex('[test]')).toBe('\\[test\\]')
      expect(escapeRegex('a+b*c?d{e}f^g$h|i')).toBe('a\\+b\\*c\\?d\\{e\\}f\\^g\\$h\\|i')
    })

    it('handles empty string', () => {
      expect(escapeRegex('')).toBe('')
    })

    it('handles string without special chars', () => {
      expect(escapeRegex('hello')).toBe('hello')
    })
  })

  describe('FLAG_DESCRIPTIONS', () => {
    it('has all flags', () => {
      expect(Object.keys(FLAG_DESCRIPTIONS)).toEqual(['g', 'i', 'm', 's', 'u', 'y'])
    })

    it('has descriptions for all flags', () => {
      for (const desc of Object.values(FLAG_DESCRIPTIONS)) {
        expect(desc.length).toBeGreaterThan(0)
      }
    })
  })

  describe('FLAG_OPTIONS', () => {
    it('has 6 options', () => {
      expect(FLAG_OPTIONS).toHaveLength(6)
    })

    it('each option has value and label', () => {
      for (const opt of FLAG_OPTIONS) {
        expect(opt.value).toBeTruthy()
        expect(opt.label).toBeTruthy()
      }
    })
  })

  describe('CHEATSHEET', () => {
    it('has entries', () => {
      expect(CHEATSHEET.length).toBeGreaterThan(0)
    })

    it('each entry has pattern and description', () => {
      for (const entry of CHEATSHEET) {
        expect(entry.pattern).toBeTruthy()
        expect(entry.description).toBeTruthy()
      }
    })

    it('includes common patterns', () => {
      const patterns = CHEATSHEET.map(e => e.pattern)
      expect(patterns).toContain('\\d')
      expect(patterns).toContain('\\w')
      expect(patterns).toContain('\\s')
      expect(patterns).toContain('^')
      expect(patterns).toContain('$')
      expect(patterns).toContain('*')
      expect(patterns).toContain('+')
      expect(patterns).toContain('?')
      expect(patterns).toContain('(...)')
      expect(patterns).toContain('[...]')
    })
  })
})