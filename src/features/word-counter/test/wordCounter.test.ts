import { describe, expect, it } from 'vitest'
import { countStats } from '../lib/wordCounter'

describe('Word Counter', () => {
  it('counts words correctly', () => {
    const result = countStats('Hello world')
    expect(result.words).toBe(2)
  })

  it('counts characters correctly', () => {
    const result = countStats('Hello')
    expect(result.characters).toBe(5)
    expect(result.charactersNoSpaces).toBe(5)
  })

  it('counts characters without spaces', () => {
    const result = countStats('Hello world')
    expect(result.charactersNoSpaces).toBe(10)
  })

  it('counts sentences correctly', () => {
    const result = countStats('Hello world. How are you? I am fine!')
    expect(result.sentences).toBe(3)
  })

  it('counts paragraphs correctly', () => {
    const result = countStats('Hello world\n\nHow are you')
    expect(result.paragraphs).toBe(2)
  })

  it('handles empty string', () => {
    const result = countStats('')
    expect(result.words).toBe(0)
    expect(result.characters).toBe(0)
  })

  it('handles single word', () => {
    const result = countStats('Hello')
    expect(result.words).toBe(1)
    expect(result.sentences).toBe(1)
    expect(result.paragraphs).toBe(1)
  })

  it('estimates reading time', () => {
    const text = Array(200).fill('word').join(' ')
    const result = countStats(text)
    expect(result.readingTime).toBe('1 min')
  })

  it('estimates speaking time', () => {
    const text = Array(150).fill('word').join(' ')
    const result = countStats(text)
    expect(result.speakingTime).toBe('1 min')
  })
})
