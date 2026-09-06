import html2canvas from 'html2canvas'

export interface HtmlToImageResult {
  file: File
  objectUrl: string
  width: number
  height: number
}

export async function renderHtmlToImage(
  html: string,
  options: { width: number; height: number; backgroundColor: string }
): Promise<HtmlToImageResult> {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-9999px'
  container.style.top = '0'
  container.style.width = `${options.width}px`
  container.style.height = `${options.height}px`
  container.style.backgroundColor = options.backgroundColor
  container.style.overflow = 'hidden'
  container.innerHTML = html
  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      width: options.width,
      height: options.height,
      backgroundColor: options.backgroundColor,
      useCORS: true,
    })

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    )
    if (!blob) throw new Error('Canvas toBlob returned null')

    const resultFile = new File([blob], 'html-screenshot.png', { type: 'image/png', lastModified: Date.now() })
    return {
      file: resultFile,
      objectUrl: URL.createObjectURL(resultFile),
      width: options.width,
      height: options.height,
    }
  } finally {
    document.body.removeChild(container)
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
