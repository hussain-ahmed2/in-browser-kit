import { describe, expect, it } from 'vitest'
import { generateLinearGradient, generateRadialGradient, generateGradient, generateCssBlock } from '../lib/cssGradient'

describe('CSS Gradient Generator', () => {
  describe('generateLinearGradient', () => {
    it('generates linear gradient with two colors', () => {
      const result = generateLinearGradient(['#ff0000', '#0000ff'], 90)
      expect(result).toBe('linear-gradient(90deg, #ff0000, #0000ff)')
    })

    it('generates single color gradient', () => {
      const result = generateLinearGradient(['#ff0000'], 45)
      expect(result).toBe('linear-gradient(45deg, #ff0000)')
    })

    it('handles empty colors', () => {
      expect(generateLinearGradient([], 0)).toBe('')
    })
  })

  describe('generateRadialGradient', () => {
    it('generates radial gradient', () => {
      const result = generateRadialGradient(['#ff0000', '#0000ff'])
      expect(result).toBe('radial-gradient(circle, #ff0000, #0000ff)')
    })

    it('handles empty colors', () => {
      expect(generateRadialGradient([])).toBe('')
    })
  })

  describe('generateGradient', () => {
    it('dispatches to correct function based on type', () => {
      const linear = generateGradient('linear', ['#a', '#b'], 0)
      expect(linear).toContain('linear-gradient')

      const radial = generateGradient('radial', ['#a', '#b'], 0)
      expect(radial).toContain('radial-gradient')
    })
  })

  describe('generateCssBlock', () => {
    it('generates full CSS block', () => {
      const result = generateCssBlock('linear', ['#a', '#b'], 90)
      expect(result).toMatch(/^background: linear-gradient/)
      expect(result).toMatch(/;$/)
    })
  })
})
