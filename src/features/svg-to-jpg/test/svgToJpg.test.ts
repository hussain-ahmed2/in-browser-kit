import { describe, expect, it } from 'vitest'
import { convertSvgToJpg } from '../lib/svgToJpg'

describe('SVG to JPG Converter', () => {
  it('exports convertSvgToJpg function', () => {
    expect(typeof convertSvgToJpg).toBe('function')
  })

  it('convertSvgToJpg is callable', () => {
    expect(convertSvgToJpg).toBeDefined()
  })
})
