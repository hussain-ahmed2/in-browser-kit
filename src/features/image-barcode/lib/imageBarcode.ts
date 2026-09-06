import JsBarcode from 'jsbarcode'

export interface BarcodeResult {
  dataUrl: string
  svgString: string
}

export function generateBarcode(
  value: string,
  format: string,
  options: { width?: number; height?: number; displayValue?: boolean } = {}
): BarcodeResult {
  const canvas = document.createElement('canvas')

  try {
    JsBarcode(canvas, value, {
      format: format as never,
      width: options.width ?? 2,
      height: options.height ?? 100,
      displayValue: options.displayValue ?? true,
      fontSize: 16,
      margin: 10,
    })
  } catch (err) {
    throw new Error(`Invalid barcode value for ${format}: ${(err as Error).message}`)
  }

  const dataUrl = canvas.toDataURL('image/png')

  // Also generate SVG
  const svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  try {
    JsBarcode(svgElement, value, {
      format: format as never,
      width: options.width ?? 2,
      height: options.height ?? 100,
      displayValue: options.displayValue ?? true,
      fontSize: 16,
      margin: 10,
    })
  } catch {
    // SVG generation failed, return canvas only
  }

  const svgString = new XMLSerializer().serializeToString(svgElement)

  return { dataUrl, svgString }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
