import type { WatermarkSettings, PositionPreset } from '../types'

export type { WatermarkSettings, PositionPreset }

export const POSITION_PRESETS: readonly PositionPreset[] = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
]

export interface Point {
  x: number
  y: number
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function resolvePresetCenter(
  preset: PositionPreset,
  imgW: number,
  imgH: number,
  wmW: number,
  wmH: number,
  margin: number
): Point {
  const halfW = wmW / 2
  const halfH = wmH / 2
  const minX = margin + halfW
  const maxX = imgW - margin - halfW
  const minY = margin + halfH
  const maxY = imgH - margin - halfH

  const parts = preset.split('-')
  const vertical = parts[0] as 'top' | 'center' | 'bottom'
  const horizontal = parts[1] ?? 'center'

  const x =
    horizontal === 'center'
      ? clamp(imgW / 2, minX, maxX)
      : horizontal === 'left'
        ? clamp(minX, minX, maxX)
        : clamp(maxX, minX, maxX)

  const y =
    vertical === 'center'
      ? clamp(imgH / 2, minY, maxY)
      : vertical === 'top'
        ? clamp(minY, minY, maxY)
        : clamp(maxY, minY, maxY)

  return { x, y }
}

export function computeRotatedBounds(
  w: number,
  h: number,
  angleDeg: number
): { width: number; height: number } {
  const rad = (angleDeg * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  return {
    width: Math.round(w * cos + h * sin),
    height: Math.round(w * sin + h * cos),
  }
}

export function buildFontSpec(fontSize: number, bold: boolean): string {
  return `${bold ? 'bold ' : ''}${Math.round(fontSize)}px system-ui, sans-serif`
}

export function deriveOutputName(originalName: string, format: string): string {
  const base = originalName.replace(/\.[^./]+$/, '') || 'image'
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extensions[format]
  return ext ? `${base}.${ext}` : originalName
}

export function resolveExportMime(
  format: string,
  sourceType: string
): string {
  if (format !== 'keep') return format
  if (['image/jpeg', 'image/png', 'image/webp'].includes(sourceType)) {
    return sourceType
  }
  return 'image/png'
}

export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export function renderWatermark(
  canvas: HTMLCanvasElement,
  baseImage: HTMLImageElement,
  logoImage: HTMLImageElement | null,
  settings: WatermarkSettings
): void {
  const imgW = baseImage.naturalWidth || baseImage.width
  const imgH = baseImage.naturalHeight || baseImage.height

  canvas.width = imgW
  canvas.height = imgH

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No 2d context')

  ctx.clearRect(0, 0, imgW, imgH)
  ctx.drawImage(baseImage, 0, 0)

  if (settings.type === 'text') {
    const fontSize = (settings.fontSizePct / 100) * Math.min(imgW, imgH)
    ctx.font = buildFontSpec(fontSize, settings.bold)
    const metrics = ctx.measureText(settings.text)
    const wmW = metrics.width
    const wmH = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent || fontSize

    const margin = (Math.min(imgW, imgH) * settings.marginPct) / 100
    const bounds = computeRotatedBounds(wmW, wmH, settings.rotationDeg)
    const center = resolvePresetCenter(
      settings.preset,
      imgW,
      imgH,
      bounds.width,
      bounds.height,
      margin
    )

    ctx.save()
    ctx.globalAlpha = settings.opacityPct / 100
    ctx.translate(center.x, center.y)
    ctx.rotate((settings.rotationDeg * Math.PI) / 180)
    ctx.fillStyle = settings.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(settings.text, 0, 0)
    ctx.restore()
  } else if (settings.type === 'logo' && logoImage) {
    const logoW = (settings.logoScalePct / 100) * imgW
    const logoH = (logoW / logoImage.naturalWidth) * logoImage.naturalHeight
    const margin = (Math.min(imgW, imgH) * settings.marginPct) / 100

    const bounds = computeRotatedBounds(logoW, logoH, settings.rotationDeg)
    const center = resolvePresetCenter(
      settings.preset,
      imgW,
      imgH,
      bounds.width,
      bounds.height,
      margin
    )

    ctx.save()
    ctx.globalAlpha = settings.opacityPct / 100
    ctx.translate(center.x, center.y)
    ctx.rotate((settings.rotationDeg * Math.PI) / 180)
    ctx.drawImage(logoImage, -logoW / 2, -logoH / 2, logoW, logoH)
    ctx.restore()
  }
}