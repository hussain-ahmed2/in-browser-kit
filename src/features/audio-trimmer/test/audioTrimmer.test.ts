import { describe, expect, it } from 'vitest'
import { getTrimArgs, getAudioMimeType } from '../lib/audioTrimmer'

describe('Audio Trimmer', () => {
  describe('getTrimArgs', () => {
    it('generates correct args for MP3', () => {
      const args = getTrimArgs('00:00:05', '00:00:10', 'mp3', 'input.mp3', 'output.mp3')
      expect(args).toContain('-ss')
      expect(args).toContain('00:00:05')
      expect(args).toContain('-i')
      expect(args).toContain('input.mp3')
      expect(args).toContain('-t')
      expect(args).toContain('00:00:10')
      expect(args).toContain('-c:a')
      expect(args).toContain('libmp3lame')
      expect(args).toContain('output.mp3')
    })

    it('generates correct args for WAV', () => {
      const args = getTrimArgs('00:00:00', '00:00:30', 'wav', 'in.wav', 'out.wav')
      expect(args).toContain('pcm_s16le')
      expect(args).toContain('out.wav')
    })

    it('generates correct args for FLAC', () => {
      const args = getTrimArgs('00:01:00', '00:00:05', 'flac', 'in.mp3', 'out.flac')
      expect(args).toContain('flac')
    })
  })

  describe('getAudioMimeType', () => {
    it('returns correct MIME types', () => {
      expect(getAudioMimeType('mp3')).toBe('audio/mpeg')
      expect(getAudioMimeType('wav')).toBe('audio/wav')
      expect(getAudioMimeType('ogg')).toBe('audio/ogg')
      expect(getAudioMimeType('aac')).toBe('audio/aac')
      expect(getAudioMimeType('flac')).toBe('audio/flac')
    })
  })
})
