export interface FaviconSize {
  id: string
  width: number
  height: number
  label: string
  category: 'favicon' | 'apple' | 'android'
}

export const FAVICON_SIZES: FaviconSize[] = [
  { id: 'favicon-16', width: 16, height: 16, label: '16×16', category: 'favicon' },
  { id: 'favicon-32', width: 32, height: 32, label: '32×32', category: 'favicon' },
  { id: 'favicon-48', width: 48, height: 48, label: '48×48', category: 'favicon' },
  { id: 'favicon-64', width: 64, height: 64, label: '64×64', category: 'favicon' },
  { id: 'favicon-128', width: 128, height: 128, label: '128×128', category: 'favicon' },
  { id: 'favicon-256', width: 256, height: 256, label: '256×256', category: 'favicon' },
  { id: 'favicon-512', width: 512, height: 512, label: '512×512', category: 'favicon' },
  { id: 'apple-180', width: 180, height: 180, label: '180×180 (Apple)', category: 'apple' },
  { id: 'android-192', width: 192, height: 192, label: '192×192 (Android)', category: 'android' },
  { id: 'android-512', width: 512, height: 512, label: '512×512 (Android)', category: 'android' },
]

export interface FaviconOptions {
  mode: 'crop' | 'pad' | 'transparent'
  backgroundColor: string
  selectedSizes: number[]
}

export interface FaviconResult {
  pngs: { size: FaviconSize; blob: Blob; dataUrl: string }[]
  icoBlob: Blob
  icoDataUrl: string
  manifestJson: string
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export async function generateFavicon(
  file: File,
  options: FaviconOptions
): Promise<FaviconResult> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const selectedSizes = FAVICON_SIZES.filter((s) =>
        options.selectedSizes.includes(s.width)
      )

      const pngs: { size: FaviconSize; blob: Blob; dataUrl: string }[] = []

      const promises = selectedSizes.map((size) => {
        return new Promise<void>((res, rej) => {
          const canvas = document.createElement('canvas')
          canvas.width = size.width
          canvas.height = size.height
          const ctx = canvas.getContext('2d')!

          if (options.mode === 'pad') {
            ctx.fillStyle = options.backgroundColor
            ctx.fillRect(0, 0, size.width, size.height)
          }
          // transparent mode: leave canvas transparent (default canvas is transparent)

          // Calculate source rectangle to maintain aspect ratio
          const srcRatio = img.naturalWidth / img.naturalHeight
          const dstRatio = size.width / size.height

          let srcX = 0, srcY = 0, srcW = img.naturalWidth, srcH = img.naturalHeight

          if (options.mode === 'crop') {
            if (srcRatio > dstRatio) {
              srcW = img.naturalHeight * dstRatio
              srcX = (img.naturalWidth - srcW) / 2
            } else {
              srcH = img.naturalWidth / dstRatio
              srcY = (img.naturalHeight - srcH) / 2
            }
          } else {
            if (srcRatio > dstRatio) {
              srcH = img.naturalWidth / dstRatio
              srcY = (img.naturalHeight - srcH) / 2
            } else {
              srcW = img.naturalHeight * dstRatio
              srcX = (img.naturalWidth - srcW) / 2
            }
          }

          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, size.width, size.height)

          canvas.toBlob((blob) => {
            if (!blob) {
              rej(new Error(`Failed to generate ${size.width}×${size.height}`))
              return
            }
            const dataUrl = canvas.toDataURL('image/png')
            pngs.push({ size, blob: blob!, dataUrl })
            res()
          }, 'image/png')
        })
      })

      Promise.all(promises)
        .then(() => {
          // Generate ICO from PNGs (only favicon sizes)
          const icoSizes = pngs.filter((p) => p.size.category === 'favicon')
          generateICO(icoSizes).then((icoBlob) => {
            const icoDataUrl = URL.createObjectURL(icoBlob)

            // Generate manifest
            const manifest = generateManifest(pngs, file.name)
            const manifestJson = JSON.stringify(manifest, null, 2)

            resolve({
              pngs,
              icoBlob,
              icoDataUrl,
              manifestJson,
            })
          })
        })
        .catch(reject)
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

function generateICO(
  pngs: { size: FaviconSize; blob: Blob; dataUrl: string }[]
): Promise<Blob> {
  return Promise.all(
    pngs.map((p) => blobToArrayBuffer(p.blob))
  ).then((buffers) => {
    // ICO header: 6 bytes
    //   0-1: reserved (0)
    //   2-3: type (1 = ICO)
    //   4-5: count
    const header = new DataView(new ArrayBuffer(6))
    header.setUint16(0, 0, true)
    header.setUint16(2, 1, true)
    header.setUint16(4, pngs.length, true)

    // Directory entries: 16 bytes each
    //   0: width (0 = 256)
    //   1: height (0 = 256)
    //   2: color count (0 = no palette)
    //   3: reserved (0)
    //   4-5: color planes (0 or 1)
    //   6-7: bits per pixel (0 or 32)
    //   8-11: image size in bytes
    //   12-15: offset of image data
    const dirSize = pngs.length * 16
    const headerBuf = new ArrayBuffer(6 + dirSize)
    const view = new DataView(headerBuf)
    new Uint8Array(headerBuf).set(new Uint8Array(header.buffer), 0)

    let offset = 6 + dirSize
    pngs.forEach((p, i) => {
      const entryOffset = 6 + i * 16
      const w = p.size.width === 256 ? 0 : p.size.width
      const h = p.size.height === 256 ? 0 : p.size.height
      view.setUint8(entryOffset, w)
      view.setUint8(entryOffset + 1, h)
      view.setUint8(entryOffset + 2, 0)
      view.setUint8(entryOffset + 3, 0)
      view.setUint16(entryOffset + 4, 1, true)
      view.setUint16(entryOffset + 6, 32, true)
      view.setUint32(entryOffset + 8, buffers[i].byteLength, true)
      view.setUint32(entryOffset + 12, offset, true)
      offset += buffers[i].byteLength
    })

    // Combine header + directory + image data
    const totalSize = 6 + dirSize + buffers.reduce((a, b) => a + b.byteLength, 0)
    const result = new Uint8Array(totalSize)
    result.set(new Uint8Array(headerBuf), 0)
    let pos = 6 + dirSize
    buffers.forEach((buf) => {
      result.set(new Uint8Array(buf), pos)
      pos += buf.byteLength
    })

    return new Blob([result], { type: 'image/x-icon' })
  })
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}

function generateManifest(
  pngs: { size: FaviconSize; blob: Blob; dataUrl: string }[],
  originalName: string
): object {
  const icons = pngs
    .filter((p) => p.size.category !== 'favicon')
    .map((p) => ({
      src: `/icon-${p.size.width}.png`,
      sizes: `${p.size.width}x${p.size.height}`,
      type: 'image/png',
      purpose: 'any maskable',
    }))

  return {
    name: originalName.replace(/\.[^/.]+$/, ''),
    short_name: originalName.replace(/\.[^/.]+$/, ''),
    icons,
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export async function createZip(
  pngs: { size: FaviconSize; blob: Blob; dataUrl: string }[],
  icoBlob: Blob,
  manifestJson: string
): Promise<Blob> {
  // Dynamic import jszip
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  pngs.forEach((p) => {
    zip.file(`icon-${p.size.width}.png`, p.blob)
  })
  zip.file('favicon.ico', icoBlob)
  zip.file('site.webmanifest', manifestJson)

  return zip.generateAsync({ type: 'blob' })
}