import { describe, expect, it } from 'vitest'
import { convertMarkdownToPdf } from '../lib/markdownToPdf'

describe('Markdown to PDF Converter', () => {
  it('exports convertMarkdownToPdf function', () => {
    expect(typeof convertMarkdownToPdf).toBe('function')
  })

  it('convertMarkdownToPdf produces a Blob', async () => {
    const md = '# Hello\n\nThis is **bold** text.'
    const blob = await convertMarkdownToPdf(md)
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toContain('text/html')
  })
})
