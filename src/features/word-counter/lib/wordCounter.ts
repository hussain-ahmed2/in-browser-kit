export interface CountResult {
  words: number
  characters: number
  charactersNoSpaces: number
  sentences: number
  paragraphs: number
  readingTime: string
  speakingTime: string
}

export function countStats(text: string): CountResult {
  if (!text.trim()) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: '0 min',
      speakingTime: '0 min',
    }
  }

  const characters = text.length
  const charactersNoSpaces = text.replace(/\s/g, '').length

  const words = text.trim().split(/\s+/).filter(Boolean).length

  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0).length

  const paragraphs =
    text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length ||
    (text.trim() ? 1 : 0)

  const readingMinutes = words / 200
  const speakingMinutes = words / 150

  const readingTime =
    readingMinutes < 1 ? '< 1 min' : `${Math.ceil(readingMinutes)} min`
  const speakingTime =
    speakingMinutes < 1 ? '< 1 min' : `${Math.ceil(speakingMinutes)} min`

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    speakingTime,
  }
}
