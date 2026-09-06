/**
 * Audio format conversion utilities.
 */

export function getAudioConverterMimeType(format: string): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'ogg': return 'audio/ogg'
    case 'aac': return 'audio/aac'
    case 'flac': return 'audio/flac'
    default: return 'audio/mpeg'
  }
}

export const AUDIO_FORMATS = [
  { value: 'mp3', label: 'MP3', extension: 'mp3' },
  { value: 'wav', label: 'WAV', extension: 'wav' },
  { value: 'ogg', label: 'OGG', extension: 'ogg' },
  { value: 'aac', label: 'AAC', extension: 'aac' },
  { value: 'flac', label: 'FLAC', extension: 'flac' },
] as const
