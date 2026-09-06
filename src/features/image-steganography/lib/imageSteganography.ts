import type { StegEncodeResult, StegDecodeResult } from '../types'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error('Failed to load image')) }
    img.src = src
  })
}

function textToBinary(text: string): string {
  return text.split('').map((c) => c.charCodeAt(0).toString(2).padStart(8, '0')).join('')
}

function binaryToText(binary: string): string {
  const bytes: number[] = []
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    bytes.push(parseInt(binary.substring(i, i + 8), 2))
  }
  return String.fromCharCode(...bytes)
}

export async function encodeMessage(
  file: File,
  message: string,
  onProgress?: (p: number) => void
): Promise<StegEncodeResult> {
  if (!message) throw new Error('No message to encode')

  onProgress?.(10)
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  onProgress?.(30)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // Add null terminator
  const binaryMessage = textToBinary(message) + '00000000'
  const totalBits = binaryMessage.length

  // Check capacity (3 LSB per pixel = 3 bits per pixel, 4 channels = up to 12 bits per pixel, but we use R,G,B = 3 channels)
  const maxBits = (data.length / 4) * 3
  if (totalBits > maxBits) {
    throw new Error(`Message too long. Max ${Math.floor(maxBits / 8)} characters, got ${message.length}`)
  }

  onProgress?.(50)
  let bitIndex = 0
  for (let i = 0; i < data.length && bitIndex < totalBits; i += 4) {
    for (let channel = 0; channel < 3 && bitIndex < totalBits; channel++) {
      const bit = parseInt(binaryMessage[bitIndex])
      data[i + channel] = (data[i + channel] & 0xFE) | bit
      bitIndex++
    }
  }

  onProgress?.(80)
  ctx.putImageData(imageData, 0, 0)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png')
  )
  if (!blob) throw new Error('Canvas toBlob returned null')

  onProgress?.(100)
  const resultFile = new File([blob], file.name, { type: 'image/png', lastModified: Date.now() })
  return {
    file: resultFile,
    objectUrl: URL.createObjectURL(resultFile),
    width: canvas.width,
    height: canvas.height,
    messageLength: message.length,
  }
}

export async function decodeMessage(
  file: File,
  onProgress?: (p: number) => void
): Promise<StegDecodeResult> {
  onProgress?.(10)
  const src = URL.createObjectURL(file)
  const img = await loadImage(src)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  onProgress?.(30)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  onProgress?.(50)
  let binary = ''
  for (let i = 0; i < data.length; i += 4) {
    for (let channel = 0; channel < 3; channel++) {
      binary += (data[i + channel] & 1).toString()
    }
  }

  // Find null terminator
  let messageEnd = -1
  for (let i = 0; i + 8 <= binary.length; i += 8) {
    const byte = binary.substring(i, i + 8)
    if (byte === '00000000') {
      messageEnd = i
      break
    }
  }

  onProgress?.(80)
  if (messageEnd === -1) {
    return { message: '', success: false }
  }

  const message = binaryToText(binary.substring(0, messageEnd))
  onProgress?.(100)
  return { message, success: true }
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
