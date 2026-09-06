import { describe, expect, it } from 'vitest'
import { convertHtmlToPdf } from '../lib/htmlToPdf'

describe('HTML to PDF Converter', () => {
  it('exports convertHtmlToPdf function', () => {
    expect(typeof convertHtmlToPdf).toBe('function')
  })

  it('convertHtmlToPdf is callable', () => {
    expect(convertHtmlToPdf).toBeDefined()
  })
})
