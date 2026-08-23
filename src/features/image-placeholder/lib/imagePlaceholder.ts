export type PlaceholderStyle =
  | 'solid'
  | 'gradient'
  | 'pattern'
  | 'text'
  | 'noise'

export type GradientType = 'linear' | 'radial' | 'conic'

export interface GradientStop {
  color: string
  position: number
}

export interface PlaceholderOptions {
  width: number
  height: number
  style: PlaceholderStyle
  color?: string
  color2?: string
  text?: string
  textColor?: string
  fontSize?: number
  gradientType?: GradientType
  gradientAngle?: number
  gradientStops?: GradientStop[]
}

export interface PlaceholderResult {
  file: File
  dataUrl: string
  width: number
  height: number
}

function drawSolid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color1: string,
  color2: string,
  type: GradientType = 'linear',
  angle: number = 0,
  stops?: GradientStop[]
) {
  let grad: CanvasGradient

  if (type === 'radial') {
    const cx = w / 2
    const cy = h / 2
    const r = Math.max(w, h) / 2
    grad = ctx.createRadialGradient(cx, 0, 0, cx, cy, r)
  } else if (type === 'conic') {
    const cx = w / 2
    const cy = h / 2
    grad = ctx.createConicGradient((angle * Math.PI) / 180, cx, cy)
  } else {
    const rad = (angle * Math.PI) / 180
    const x1 = w / 2 - (w / 2) * Math.cos(rad)
    const y1 = h / 2 - (h / 2) * Math.sin(rad)
    const x2 = w / 2 + (w / 2) * Math.cos(rad)
    const y2 = h / 2 + (h / 2) * Math.sin(rad)
    grad = ctx.createLinearGradient(x1, y1, x2, y2)
  }

  if (stops && stops.length >= 2) {
    for (const stop of stops) {
      grad.addColorStop(stop.position / 100, stop.color)
    }
  } else {
    grad.addColorStop(0, color1)
    grad.addColorStop(1, color2)
  }

  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)
}

function drawPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color1: string,
  color2: string
) {
  const size = 20
  ctx.fillStyle = color1
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = color2
  for (let y = 0; y < h; y += size * 2) {
    for (let x = 0; x < w; x += size * 2) {
      ctx.fillRect(x, y, size, size)
      ctx.fillRect(x + size, y + size, size, size)
    }
  }
}

function drawText(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
  textColor: string,
  text: string,
  fontSize: number
) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = textColor
  ctx.font = `${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2)
}

function drawNoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 40
    data[i] = Math.max(0, Math.min(255, data[i] + noise))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
  }
  ctx.putImageData(imageData, 0, 0)
}

export function generatePlaceholder(
  options: PlaceholderOptions
): Promise<PlaceholderResult> {
  const {
    width,
    height,
    style,
    color = '#cccccc',
    color2 = '#999999',
    text = `${width}×${height}`,
    textColor = '#666666',
    fontSize = 24,
    gradientType = 'linear',
    gradientAngle = 0,
    gradientStops,
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  switch (style) {
    case 'solid':
      drawSolid(ctx, width, height, color)
      break
    case 'gradient':
      drawGradient(ctx, width, height, color, color2, gradientType, gradientAngle, gradientStops)
      break
    case 'pattern':
      drawPattern(ctx, width, height, color, color2)
      break
    case 'text':
      drawText(ctx, width, height, color, textColor, text, fontSize)
      break
    case 'noise':
      drawNoise(ctx, width, height, color)
      break
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob!], `placeholder-${width}x${height}.png`, {
        type: 'image/png',
      })
      resolve({
        file,
        dataUrl: canvas.toDataURL('image/png'),
        width,
        height,
      })
    }, 'image/png')
  })
}
