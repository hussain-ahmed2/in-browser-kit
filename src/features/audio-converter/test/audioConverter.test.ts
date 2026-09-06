import { describe, expect, it } from 'vitest'
import { getAudioConverterMimeType, AUDIO_FORMATS } from '../lib/audioConverter'

describe('Audio Converter', () => {
  describe('getAudioConverterMimeType', () => {
    it('returns correct MIME types for all formats', () => {
      expect(getAudioConverterMimeType('mp3')).toBe('audio/mpeg')
      expect(getAudioConverterMimeType('wav')).toBe('audio/wav')
      expect(getAudioConverterMimeType('ogg')).toBe('audio/ogg')
      expect(getAudioConverterMimeType('aac')).toBe('audio/aac')
      expect(getAudioConverterMimeType('flac')).toBe('audio/flac')
    })

    it('returns default for unknown format', () => {
      expect(getAudioConverterMimeType('xyz')).toBe('audio/mpeg')
    })
  })

  it('AUDIO_FORMATS has 5 entries', () => {
    expect(AUDIO_FORMATS).toHaveLength(5)
  })
})
