import { createWorker, type Worker } from 'tesseract.js'

let cachedWorker: Worker | null = null
let cachedLang: string | null = null

export interface OcrResult {
  text: string
  confidence: number
  words: number
  lines: number
}

export async function performOcr(
  file: File,
  lang: string = 'eng',
  onProgress?: (status: string, progress: number) => void
): Promise<OcrResult> {
  onProgress?.('Loading OCR engine...', 5)

  // Reuse cached worker if same language
  if (cachedWorker && cachedLang === lang) {
    onProgress?.('Worker ready, processing image...', 30)
  } else {
    // Terminate old worker
    if (cachedWorker) {
      await cachedWorker.terminate()
      cachedWorker = null
    }

    onProgress?.(`Downloading ${lang} language data (cached on repeat visits)...`, 10)
    cachedWorker = await createWorker(lang, undefined, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === 'recognizing text') {
          onProgress?.('Recognizing text...', 50 + Math.round(m.progress * 45))
        } else if (m.status === 'loading language traineddata') {
          onProgress?.('Loading language model...', 10 + Math.round(m.progress * 20))
        }
      },
    })
    cachedLang = lang
  }

  onProgress?.('Processing image...', 30)

  const src = URL.createObjectURL(file)
  const { data } = await cachedWorker.recognize(src)
  URL.revokeObjectURL(src)

  onProgress?.('Done', 100)

  return {
    text: data.text,
    confidence: Math.round(data.confidence),
    words: (data as unknown as { words?: unknown[] }).words?.length ?? data.text.split(/\s+/).filter(Boolean).length,
    lines: (data as unknown as { lines?: unknown[] }).lines?.length ?? data.text.split('\n').filter(Boolean).length,
  }
}

export async function terminateWorker() {
  if (cachedWorker) {
    await cachedWorker.terminate()
    cachedWorker = null
    cachedLang = null
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export const OCR_LANGUAGES = [
  { label: 'English', value: 'eng' },
  { label: 'Spanish', value: 'spa' },
  { label: 'French', value: 'fra' },
  { label: 'German', value: 'deu' },
  { label: 'Italian', value: 'ita' },
  { label: 'Portuguese', value: 'por' },
  { label: 'Chinese (Simplified)', value: 'chi_sim' },
  { label: 'Japanese', value: 'jpn' },
  { label: 'Korean', value: 'kor' },
  { label: 'Arabic', value: 'ara' },
] as const
