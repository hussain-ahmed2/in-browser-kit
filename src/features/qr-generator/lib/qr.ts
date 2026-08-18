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

export interface QrPreset {
  slug: string
  label: string
  description: string
  example: string
  tips: string[]
}

export const QR_PRESETS: readonly QrPreset[] = [
  {
    slug: 'text',
    label: 'Text',
    description: 'Plain text snippet',
    example: 'Hello, world!',
    tips: [
      'Type any text — it will be scanned as-is.',
      "Replace 'Hello, world!' with your own message.",
    ],
  },
  {
    slug: 'url',
    label: 'Link',
    description: 'Open a website',
    example: 'https://example.com',
    tips: [
      "Replace 'example.com' with the full URL you want to open.",
      "Keep the 'https://' prefix so scanners recognize it as a link.",
    ],
  },
  {
    slug: 'wifi',
    label: 'WiFi',
    description: 'Connect to a wireless network',
    example: 'WIFI:T:WPA;S:YourNetworkName;P:YourPassword;;',
    tips: [
      "Replace 'YourNetworkName' with your network's name (SSID).",
      "Replace 'YourPassword' with the WiFi password.",
      "Use 'WPA2' or 'WPA3' for secured networks, 'nopass' for open ones.",
      "Keep the 'WIFI:…;;' structure — scanners read the whole string.",
    ],
  },
  {
    slug: 'email',
    label: 'Email',
    description: 'Open a pre-filled email',
    example: 'mailto:name@example.com?subject=Hello&body=Hi there',
    tips: [
      "Replace 'name@example.com' with the recipient address.",
      "Subject and body are optional — delete the '?subject=…&body=…' part to send an empty email.",
    ],
  },
  {
    slug: 'phone',
    label: 'Phone',
    description: 'Start a phone call',
    example: 'tel:+15551234567',
    tips: [
      "Replace '+15551234567' with the full phone number in international format.",
    ],
  },
  {
    slug: 'sms',
    label: 'SMS',
    description: 'Send a text message',
    example: 'smsto:+15551234567:Hello',
    tips: [
      "Replace '+15551234567' with the recipient's phone number.",
      "Anything after the first colon is the pre-filled message.",
    ],
  },
  {
    slug: 'vcard',
    label: 'Contact',
    description: 'Save a business card',
    example:
      'BEGIN:VCARD\nVERSION:3.0\nN:Last;First\nFN:First Last\nTEL:+15551234567\nEMAIL:name@example.com\nEND:VCARD',
    tips: [
      "Edit the 'N:' (last;first), 'FN:' (full name), 'TEL:', and 'EMAIL:' lines.",
      "Add more fields on new lines, e.g. 'ORG:Company', 'ADR:Address', 'URL:site.com'.",
      "Leave the first 'BEGIN:VCARD' and last 'END:VCARD' lines untouched.",
    ],
  },
  {
    slug: 'bitcoin',
    label: 'Crypto',
    description: 'Request payment to an address',
    example:
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.01&label=Donation',
    tips: [
      "Replace the address after 'bitcoin:' with your own wallet address.",
      "Amount and label are optional — delete the '?amount=…&label=…' part to omit them.",
    ],
  },
]

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