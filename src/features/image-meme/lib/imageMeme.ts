export interface MemeResult {
  file: File
  objectUrl: string
  width: number
  height: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

function drawMemeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  canvasWidth: number,
  y: number,
  options: { fontSize: number; fontFamily: string; textColor: string; strokeColor: string; strokeWidth: number }
) {
  if (!text) return

  ctx.font = `bold ${options.fontSize}px ${options.fontFamily}, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  const maxWidth = canvasWidth * 0.9
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)

  const lineHeight = options.fontSize * 1.2
  lines.forEach((line, i) => {
    const ly = y + i * lineHeight
    if (options.strokeWidth > 0) {
      ctx.strokeStyle = options.strokeColor
      ctx.lineWidth = options.strokeWidth
      ctx.lineJoin = 'round'
      ctx.strokeText(line, canvasWidth / 2, ly)
    }
    ctx.fillStyle = options.textColor
    ctx.fillText(line, canvasWidth / 2, ly)
  })
}

export async function createMeme(
  file: File,
  options: {
    topText: string
    bottomText: string
    fontSize: number
    fontFamily: string
    textColor: string
    strokeColor: string
    strokeWidth: number
  }
): Promise<MemeResult> {
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!

  ctx.drawImage(img, 0, 0)

  drawMemeText(ctx, options.topText, canvas.width, 20, options)

  // Bottom text: draw from bottom up
  if (options.bottomText) {
    ctx.font = `bold ${options.fontSize}px ${options.fontFamily}, sans-serif`
    const words = options.bottomText.split(' ')
    const lines: string[] = []
    let currentLine = ''
    const maxWidth = canvas.width * 0.9

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    if (currentLine) lines.push(currentLine)

    const lineHeight = options.fontSize * 1.2
    const totalHeight = lines.length * lineHeight
    const startY = canvas.height - totalHeight - 20

    lines.forEach((line, i) => {
      const ly = startY + i * lineHeight
      if (options.strokeWidth > 0) {
        ctx.strokeStyle = options.strokeColor
        ctx.lineWidth = options.strokeWidth
        ctx.lineJoin = 'round'
        ctx.strokeText(line, canvas.width / 2, ly)
      }
      ctx.fillStyle = options.textColor
      ctx.fillText(line, canvas.width / 2, ly)
    })
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.92)
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  const resultFile = new File([blob], file.name, { type: blob.type || file.type, lastModified: Date.now() })
  return { file: resultFile, objectUrl: URL.createObjectURL(resultFile), width: canvas.width, height: canvas.height }
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
