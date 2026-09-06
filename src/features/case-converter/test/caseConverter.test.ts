import { describe, expect, it } from 'vitest'
import { convertCase } from '../lib/caseConverter'

describe('Case Converter', () => {
  it('converts to UPPERCASE', () => {
    expect(convertCase('hello world', 'uppercase')).toBe('HELLO WORLD')
  })

  it('converts to lowercase', () => {
    expect(convertCase('HELLO WORLD', 'lowercase')).toBe('hello world')
  })

  it('converts to Title Case', () => {
    expect(convertCase('hello world', 'title')).toBe('Hello World')
  })

  it('converts to Sentence case', () => {
    expect(convertCase('hello world. how are you?', 'sentence')).toBe(
      'Hello world. How are you?'
    )
  })

  it('converts to camelCase', () => {
    expect(convertCase('hello world', 'camel')).toBe('helloWorld')
  })

  it('converts to PascalCase', () => {
    expect(convertCase('hello world', 'pascal')).toBe('HelloWorld')
  })

  it('converts to snake_case', () => {
    expect(convertCase('hello world', 'snake')).toBe('hello_world')
  })

  it('converts to kebab-case', () => {
    expect(convertCase('hello world', 'kebab')).toBe('hello-world')
  })

  it('converts to CONSTANT_CASE', () => {
    expect(convertCase('hello world', 'constant')).toBe('HELLO_WORLD')
  })

  it('converts to dot.case', () => {
    expect(convertCase('hello world', 'dot')).toBe('hello.world')
  })

  it('converts to path/case', () => {
    expect(convertCase('hello world', 'path')).toBe('hello/world')
  })

  it('toggles case', () => {
    expect(convertCase('Hello World', 'toggle')).toBe('hELLO wORLD')
  })

  it('handles empty string', () => {
    expect(convertCase('', 'uppercase')).toBe('')
  })

  it('handles camelCase input for snake_case', () => {
    expect(convertCase('helloWorld', 'snake')).toBe('hello_world')
  })
})
