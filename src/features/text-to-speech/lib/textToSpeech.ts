/**
 * Text-to-Speech utilities using the Web Speech API.
 */

export interface SpeechVoice {
  name: string
  lang: string
  localService: boolean
}

export function getAvailableVoices(): SpeechVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  return window.speechSynthesis.getVoices().map((v) => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService,
  }))
}

export function speak(
  text: string,
  options: { voice?: string; rate?: number; pitch?: number; onEnd?: () => void; onError?: () => void }
): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    options.onError?.()
    return
  }

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = options.rate ?? 1
  utterance.pitch = options.pitch ?? 1

  if (options.voice) {
    const voices = window.speechSynthesis.getVoices()
    const selected = voices.find((v) => v.name === options.voice)
    if (selected) utterance.voice = selected
  }

  utterance.onend = () => options.onEnd?.()
  utterance.onerror = () => options.onError?.()

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Attempt to record TTS output using MediaRecorder + AudioContext.
 * Note: This is a best-effort approach as not all browsers support
 * capturing speech synthesis output.
 */
export async function recordSpeech(
  text: string,
  options: { voice?: string; rate?: number; pitch?: number }
): Promise<Blob | null> {
  // Web Speech API doesn't provide direct audio capture.
  // We return null and the UI falls back to just playing.
  return null
}
