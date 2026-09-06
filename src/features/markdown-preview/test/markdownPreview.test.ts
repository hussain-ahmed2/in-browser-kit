import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../lib/markdownPreview'

describe('Markdown Preview', () => {
  it('parses headings', () => {
    const result = parseMarkdown('# Hello')
    expect(result).toContain('<h1')
    expect(result).toContain('Hello')
  })

  it('parses bold text', () => {
    const result = parseMarkdown('**bold**')
    expect(result).toContain('<strong')
    expect(result).toContain('bold')
  })

  it('parses italic text', () => {
    const result = parseMarkdown('*italic*')
    expect(result).toContain('<em')
    expect(result).toContain('italic')
  })

  it('parses links', () => {
    const result = parseMarkdown('[link](https://example.com)')
    expect(result).toContain('<a')
    expect(result).toContain('https://example.com')
  })

  it('parses unordered lists', () => {
    const result = parseMarkdown('- item1\n- item2')
    expect(result).toContain('<ul')
    expect(result).toContain('<li')
  })

  it('parses code blocks', () => {
    const result = parseMarkdown('`code`')
    expect(result).toContain('<code')
    expect(result).toContain('code')
  })

  it('returns empty string for empty input', () => {
    const result = parseMarkdown('')
    expect(result).toBe('')
  })

  it('parses paragraphs', () => {
    const result = parseMarkdown('Hello world')
    expect(result).toContain('<p')
    expect(result).toContain('Hello world')
  })
})
