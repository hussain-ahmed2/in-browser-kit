import QRCode from 'qrcode'

export type QrEcLevel = 'L' | 'M' | 'Q' | 'H'

export const QR_EC_LEVELS: readonly QrEcLevel[] = ['L', 'M', 'Q', 'H']

export const QR_EC_LABELS: Record<QrEcLevel, string> = {
  L: 'Low (~7%)',
  M: 'Medium (~15%)',
  Q: 'Quartile (~25%)',
  H: 'High (~30%)',
}

export const QR_CAPACITY_BYTES: Record<QrEcLevel, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
}

export interface QrOptions {
  size?: number
  ecLevel?: QrEcLevel
}

export async function generateQrDataUrl(
  text: string,
  options: QrOptions = {}
): Promise<string> {
  const { size = 256, ecLevel = 'M' } = options
  return QRCode.toDataURL(text, {
    width: size,
    errorCorrectionLevel: ecLevel,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

export async function generateQrSvg(
  text: string,
  options: Pick<QrOptions, 'ecLevel'> = {}
): Promise<string> {
  const { ecLevel = 'M' } = options
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: ecLevel,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const byteString = atob(dataUrl.split(',')[1])
  const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: mimeString })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getCapacityChars(ecLevel: QrEcLevel): number {
  return QR_CAPACITY_BYTES[ecLevel]
}

export function validateQrInput(text: string, ecLevel: QrEcLevel): string | null {
  if (!text.trim()) return 'Enter text or a URL to generate a QR code.'
  const maxChars = QR_CAPACITY_BYTES[ecLevel]
  if (text.length > maxChars) {
    return `Input too long for error correction level ${ecLevel}. Maximum ${maxChars} characters.`
  }
  return null
}