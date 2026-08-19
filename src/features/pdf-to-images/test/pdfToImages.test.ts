import { describe, expect, it } from 'vitest'
import {
  getPageRangeString,
  parsePageRange,
} from '../lib/utils'

describe('PDF to Images utilities', () => {
  describe('getPageRangeString', () => {
    it('returns empty string for empty array', () => {
      expect(getPageRangeString([])).toBe('')
    })

    it('returns single page as string', () => {
      expect(getPageRangeString([5])).toBe('5')
    })

    it('returns range for consecutive pages', () => {
      expect(getPageRangeString([1, 2, 3, 4, 5])).toBe('1-5')
    })

    it('handles multiple ranges', () => {
      expect(getPageRangeString([1, 2, 3, 5, 6, 8])).toBe('1-3, 5-6, 8')
    })

    it('handles unsorted input', () => {
      expect(getPageRangeString([5, 1, 3, 2, 4])).toBe('1-5')
    })

    it('handles single pages mixed with ranges', () => {
      expect(getPageRangeString([1, 3, 4, 6, 7, 9])).toBe('1, 3-4, 6-7, 9')
    })
  })

  describe('parsePageRange', () => {
    it('returns all pages for empty input', () => {
      expect(parsePageRange('', 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('parses single page', () => {
      expect(parsePageRange('3', 10)).toEqual([3])
    })

    it('parses range', () => {
      expect(parsePageRange('2-5', 10)).toEqual([2, 3, 4, 5])
    })

    it('parses multiple ranges and pages', () => {
      expect(parsePageRange('1, 3-5, 8', 10)).toEqual([1, 3, 4, 5, 8])
    })

    it('handles spaces', () => {
      expect(parsePageRange(' 1 , 3 - 5 , 8 ', 10)).toEqual([1, 3, 4, 5, 8])
    })

    it('clamps to total pages', () => {
      expect(parsePageRange('1-10', 5)).toEqual([1, 2, 3, 4, 5])
    })

    it('ignores invalid ranges', () => {
      expect(parsePageRange('5-3', 10)).toEqual([])
    })

    it('ignores out of bounds pages', () => {
      expect(parsePageRange('0, 11', 10)).toEqual([])
    })

    it('deduplicates pages', () => {
      expect(parsePageRange('1, 3-5, 4', 10)).toEqual([1, 3, 4, 5])
    })

    it('returns sorted pages', () => {
      expect(parsePageRange('5, 1, 3', 10)).toEqual([1, 3, 5])
    })
  })

  describe('edge cases', () => {
    it('handles large page numbers', () => {
      expect(parsePageRange('100-200', 150)).toEqual(
        Array.from({ length: 51 }, (_, i) => i + 100)
      )
    })

    it('handles single page at boundaries', () => {
      expect(parsePageRange('1', 1)).toEqual([1])
      expect(parsePageRange('5', 5)).toEqual([5])
    })

    it('handles range at boundaries', () => {
      expect(parsePageRange('1-5', 5)).toEqual([1, 2, 3, 4, 5])
    })
  })
})