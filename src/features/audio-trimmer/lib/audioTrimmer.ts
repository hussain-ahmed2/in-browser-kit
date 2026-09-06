/**
 * Audio trimming utilities using FFmpeg (via media-converter's FFmpeg service).
 * This module provides the argument construction for audio trimming.
 */

export function getTrimArgs(
  startTime: string,
  duration: string,
  outputFormat: string,
  inputName: string,
  outputName: string
): string[] {
  const args: string[] = []

  // Trim arguments
  args.push('-ss', startTime)
  args.push('-i', inputName)
  args.push('-t', duration)

  // Audio codec based on format
  switch (outputFormat) {
    case 'mp3':
      args.push('-c:a', 'libmp3lame', '-b:a', '192k')
      break
    case 'wav':
      args.push('-c:a', 'pcm_s16le')
      break
    case 'ogg':
      args.push('-c:a', 'libvorbis')
      break
    case 'aac':
      args.push('-c:a', 'aac', '-b:a', '192k')
      break
    case 'flac':
      args.push('-c:a', 'flac')
      break
    default:
      args.push('-c:a', 'libmp3lame', '-b:a', '192k')
  }

  args.push(outputName)
  return args
}

export function getAudioMimeType(format: string): string {
  switch (format) {
    case 'mp3': return 'audio/mpeg'
    case 'wav': return 'audio/wav'
    case 'ogg': return 'audio/ogg'
    case 'aac': return 'audio/aac'
    case 'flac': return 'audio/flac'
    default: return 'audio/mpeg'
  }
}
