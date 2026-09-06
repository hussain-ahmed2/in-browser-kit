export interface AsciiResult {
  text: string
  html: string
  width: number
  height: number
  lines: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

export async function imageToAscii(
  file: File,
  options: { width: number; charset: string; colored: boolean },
  onProgress?: (p: number) => void
): Promise<AsciiResult> {
  onProgress?.(10)
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  onProgress?.(30)
  const aspectRatio = img.naturalHeight / img.naturalWidth
  const targetWidth = options.width
  const targetHeight = Math.max(1, Math.round(targetWidth * aspectRatio * 0.5))

  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

  const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight)
  const data = imageData.data

  onProgress?.(60)
  const charset = options.charset
  const lines: string[] = []
  const htmlLines: string[] = []

  for (let y = 0; y < targetHeight; y++) {
    let line = ''
    let htmlLine = ''
    for (let x = 0; x < targetWidth; x++) {
      const i = (y * targetWidth + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
      const charIndex = Math.floor(brightness * (charset.length - 1))
      const char = charset[charIndex]
      line += char

      if (options.colored) {
        htmlLine += `<span style="color:rgb(${r},${g},${b})">${escapeHtml(char)}</span>`
      } else {
        htmlLine += escapeHtml(char)
      }
    }
    lines.push(line)
    htmlLines.push(htmlLine)
  }

  onProgress?.(90)
  const text = lines.join('\n')
  const html = `<pre style="font-family:monospace;font-size:4px;line-height:4px;letter-spacing:0px">${htmlLines.join('\n')}</pre>`

  onProgress?.(100)
  return { text, html, width: targetWidth, height: targetHeight, lines: targetHeight }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)
  return { width: img.naturalWidth, height: img.naturalHeight }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
