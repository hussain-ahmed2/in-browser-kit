export interface SpriteResult {
  imageBlob: Blob
  imageObjectUrl: string
  cssText: string
  spriteWidth: number
  spriteHeight: number
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

export async function createSprite(
  files: File[],
  options: { gap: number; layout: 'horizontal' | 'grid' | 'auto' }
): Promise<SpriteResult> {
  if (files.length === 0) throw new Error('No images provided')

  const images = await Promise.all(files.map(async (f) => {
    const src = URL.createObjectURL(f)
    const img = await loadImage(src)
    return { img, name: f.name.replace(/\.[^/.]+$/, '') }
  }))

  let cols: number
  if (options.layout === 'horizontal') {
    cols = images.length
  } else if (options.layout === 'grid') {
    cols = Math.ceil(Math.sqrt(images.length))
  } else {
    // auto: prefer wider layout
    cols = Math.ceil(Math.sqrt(images.length * 1.5))
  }

  const rows = Math.ceil(images.length / cols)
  const maxW = Math.max(...images.map((i) => i.img.naturalWidth))
  const maxH = Math.max(...images.map((i) => i.img.naturalHeight))

  const cellW = maxW + options.gap
  const cellH = maxH + options.gap

  const canvasW = cols * cellW
  const canvasH = rows * cellH

  const canvas = document.createElement('canvas')
  canvas.width = canvasW
  canvas.height = canvasH
  const ctx = canvas.getContext('2d')!

  const classes: string[] = []

  images.forEach((item, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * cellW
    const y = row * cellH

    ctx.drawImage(item.img, x, y)

    classes.push(`.sprite-${item.name} { background-position: -${x}px -${y}px; width: ${item.img.naturalWidth}px; height: ${item.img.naturalHeight}px; }`)
  })

  const cssText = `/* Sprite sheet: ${canvasW}x${canvasH}px, ${images.length} images */\n.sprite { background-image: url('sprite.png'); background-repeat: no-repeat; }\n\n${classes.join('\n')}`

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  return {
    imageBlob: blob,
    imageObjectUrl: URL.createObjectURL(blob),
    cssText,
    spriteWidth: canvasW,
    spriteHeight: canvasH,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
