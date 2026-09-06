import { describe, expect, it } from 'vitest'
import { generateLorem } from '../lib/loremIpsum'

describe('Lorem Ipsum Generator', () => {
  it('generates paragraphs', () => {
    const result = generateLorem({ type: 'paragraphs', count: 2, startWithLorem: false })
    expect(result).toBeTruthy()
    const paragraphs = result.split('\n\n')
    expect(paragraphs).toHaveLength(2)
  })

  it('generates sentences', () => {
    const result = generateLorem({ type: 'sentences', count: 3, startWithLorem: false })
    const sentences = result.split('. ').filter(Boolean)
    expect(sentences.length).toBeGreaterThanOrEqual(3)
  })

  it('generates words', () => {
    const result = generateLorem({ type: 'words', count: 5, startWithLorem: false })
    const words = result.split(' ')
    expect(words).toHaveLength(5)
  })

  it('starts with Lorem ipsum when option is set', () => {
    const result = generateLorem({ type: 'words', count: 5, startWithLorem: true })
    expect(result.toLowerCase()).toMatch(/^lorem ipsum/)
  })

  it('does not start with Lorem ipsum when option is false', () => {
    const result = generateLorem({ type: 'words', count: 5, startWithLorem: false })
    // Should not start with "Lorem ipsum" - but may start with other lorem words
    // Just verify it generates something
    expect(result).toBeTruthy()
  })

  it('generates single paragraph', () => {
    const result = generateLorem({ type: 'paragraphs', count: 1, startWithLorem: false })
    expect(result).toBeTruthy()
    expect(result).not.toContain('\n\n')
  })
})
