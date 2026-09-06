import { describe, expect, it, vi } from 'vitest'
import { getAvailableVoices, speak, stopSpeaking } from '../lib/textToSpeech'

describe('Text to Speech', () => {
  it('exports all functions', () => {
    expect(typeof getAvailableVoices).toBe('function')
    expect(typeof speak).toBe('function')
    expect(typeof stopSpeaking).toBe('function')
  })

  it('getAvailableVoices returns array (or empty in test env)', () => {
    const voices = getAvailableVoices()
    expect(Array.isArray(voices)).toBe(true)
  })
})
