import { describe, expect, it } from 'vitest'
import { isSpeechRecognitionSupported, createRecognition, LANGUAGES } from '../lib/speechToText'

describe('Speech to Text', () => {
  it('exports all functions and constants', () => {
    expect(typeof isSpeechRecognitionSupported).toBe('function')
    expect(typeof createRecognition).toBe('function')
    expect(Array.isArray(LANGUAGES)).toBe(true)
    expect(LANGUAGES.length).toBeGreaterThan(0)
  })

  it('isSpeechRecognitionSupported returns boolean', () => {
    const result = isSpeechRecognitionSupported()
    expect(typeof result).toBe('boolean')
  })

  it('LANGUAGES has expected entries', () => {
    const codes = LANGUAGES.map((l) => l.code)
    expect(codes).toContain('en-US')
    expect(codes).toContain('es-ES')
  })
})
