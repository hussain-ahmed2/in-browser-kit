import { describe, expect, it } from 'vitest'
import type { PlaceholderStyle, PlaceholderOptions } from '../lib/imagePlaceholder'

describe('PlaceholderStyle type', () => {
  it('accepts all valid styles', () => {
    const styles: PlaceholderStyle[] = [
      'solid',
      'gradient',
      'pattern',
      'text',
      'noise',
    ]
    expect(styles).toHaveLength(5)
  })
})

describe('PlaceholderOptions defaults', () => {
  it('has required fields', () => {
    const opts: PlaceholderOptions = {
      width: 100,
      height: 100,
      style: 'solid',
    }
    expect(opts.width).toBe(100)
    expect(opts.height).toBe(100)
    expect(opts.style).toBe('solid')
  })

  it('accepts optional fields', () => {
    const opts: PlaceholderOptions = {
      width: 200,
      height: 150,
      style: 'text',
      color: '#ff0000',
      color2: '#0000ff',
      text: 'Hello',
      textColor: '#ffffff',
      fontSize: 32,
    }
    expect(opts.color).toBe('#ff0000')
    expect(opts.text).toBe('Hello')
    expect(opts.fontSize).toBe(32)
  })
})
