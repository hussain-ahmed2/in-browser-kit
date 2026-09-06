import { removeBackground as imglyRemoveBackground } from '@imgly/background-removal'

export interface BackgroundRemoverResult {
  file: File
  objectUrl: string
  width: number
  height: number
  originalSize: number
  resultSize: number
}

export async function removeImageBackground(
  file: File,
  onProgress?: (status: string, progress: number) => void
): Promise<BackgroundRemoverResult> {
  onProgress?.('Loading AI model (~25MB, cached after first use)...', 10)
  
  const blob = await imglyRemoveBackground(file, {
    progress: (key: string, current: number, total: number) => {
      if (key === 'fetch:model') {
        onProgress?.('Downloading model...', 10 + Math.round((current / total) * 30))
      } else if (key === 'compute:inference') {
        onProgress?.('Removing background...', 50 + Math.round((current / total) * 45))
      }
    },
  })
  
  onProgress?.('Done', 100)
  
  const resultFile = new File([blob], file.name.replace(/\.[^.]+$/, '') + '-no-bg.png', { type: 'image/png' })
  const objectUrl = URL.createObjectURL(resultFile)
  
  // Get dimensions
  const img = await new Promise<HTMLImageElement>((resolve) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.src = objectUrl
  })
  
  return {
    file: resultFile, objectUrl,
    width: img.naturalWidth, height: img.naturalHeight,
    originalSize: file.size, resultSize: resultFile.size,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
