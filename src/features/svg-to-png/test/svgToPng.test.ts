import { describe, expect, it } from 'vitest'
import { convertSvgToPng } from '../lib/svgToPng'

describe('SVG to PNG Converter', () => {
  it('exports convertSvgToPng function', () => {
    expect(typeof convertSvgToPng).toBe('function')
  })

  it('convertSvgToPng is callable', () => {
    expect(convertSvgToPng).toBeDefined()
  })
})
