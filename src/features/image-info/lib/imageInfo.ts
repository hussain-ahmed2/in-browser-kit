import * as ExifReader from 'exifreader'

export interface ImageInfo {
  fileName: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  aspectRatio: string

  colorSpace?: string
  bitDepth?: number
  channels?: number

  dpi?: { x: number; y: number }
  ppi?: { x: number; y: number }

  iccProfile?: {
    description?: string
    manufacturer?: string
    model?: string
    colorSpace?: string
    renderingIntent?: number
    connectionSpace?: string
  }

  exif?: {
    make?: string
    model?: string
    software?: string
    dateTime?: string
    dateTimeOriginal?: string
    dateTimeDigitized?: string
    exposureTime?: string
    fNumber?: string
    iso?: number
    focalLength?: string
    lensModel?: string
    flash?: string
    whiteBalance?: string
    meteringMode?: string
    exposureMode?: string
    exposureProgram?: string
    orientation?: number
    gps?: {
      latitude?: number
      longitude?: number
      altitude?: number
      latitudeRef?: string
      longitudeRef?: string
    }
  }

  rawExif?: Record<string, unknown>
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function formatAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const divisor = gcd(width, height)
  return `${width / divisor}:${height / divisor}`
}

export function formatExposureTime(seconds: number): string {
  if (seconds >= 1) return `${seconds}s`
  const denominator = Math.round(1 / seconds)
  return `1/${denominator}s`
}

export function formatFNumber(fNumber: number): string {
  return `f/${fNumber.toFixed(1)}`
}

export function formatFocalLength(focalLength: number): string {
  return `${focalLength}mm`
}

export async function extractImageInfo(file: File): Promise<ImageInfo> {
  const dimensions = await getImageDimensions(file)

  const tags = await ExifReader.load(file)

  const tagsMap = tags as Record<string, { value: unknown; description?: string }>

  // Helper to safely get string values
  const getString = (key: string): string | undefined => {
    const tag = tagsMap[key]
    if (!tag || tag.value === undefined || tag.value === null) return undefined
    const val = tag.value
    if (typeof val === 'string') return val
    if (typeof val === 'number') return String(val)
    if (Array.isArray(val)) return val.map(String).join(', ')
    return String(val)
  }

  const getNumberVal = (key: string): number | undefined => {
    const tag = tagsMap[key]
    if (!tag || tag.value === undefined || tag.value === null) return undefined
    const val = tag.value
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const n = Number(val)
      return isNaN(n) ? undefined : n
    }
    if (Array.isArray(val) && val.length > 0) {
      const n = Number(val[0])
      return isNaN(n) ? undefined : n
    }
    return undefined
  }

  // Extract ICC profile info
  let iccProfile: ImageInfo['iccProfile'] = undefined
  if (tagsMap['iccProfile'] || tagsMap['icc']) {
    const icc = tagsMap['iccProfile'] || tagsMap['icc']
    const iccData = icc?.value as Record<string, unknown> | undefined
    if (iccData) {
      iccProfile = {
        description: iccData.description as string | undefined,
        manufacturer: iccData.manufacturer as string | undefined,
        model: iccData.model as string | undefined,
        colorSpace: iccData.colorSpaceType as string | undefined,
        renderingIntent: iccData.renderingIntent as number | undefined,
        connectionSpace: iccData.connectionSpace as string | undefined,
      }
    }
  }

  // Extract GPS info
  let gps: NonNullable<ImageInfo['exif']>['gps'] | undefined = undefined
  const latitude = tagsMap['GPSLatitude']?.value as number[] | undefined
  const longitude = tagsMap['GPSLongitude']?.value as number[] | undefined
  const latitudeRef = tagsMap['GPSLatitudeRef']?.value as string | undefined
  const longitudeRef = tagsMap['GPSLongitudeRef']?.value as string | undefined
  const altitude = tagsMap['GPSAltitude']?.value as number | undefined

  if (latitude && longitude) {
    const convertDMS = (dms: number[], ref: string) => {
      const degrees = dms[0]
      const minutes = dms[1]
      const seconds = dms[2]
      let decimal = degrees + minutes / 60 + seconds / 3600
      if (ref === 'S' || ref === 'W') decimal = -decimal
      return decimal
    }

    gps = {
      latitude: convertDMS(latitude, latitudeRef || 'N'),
      longitude: convertDMS(longitude, longitudeRef || 'E'),
      altitude,
      latitudeRef,
      longitudeRef,
    }
  }

  const rawExif: Record<string, unknown> = {}
  for (const [key, tag] of Object.entries(tagsMap)) {
    rawExif[key] = tag.value
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: formatAspectRatio(dimensions.width, dimensions.height),
    colorSpace: getString('ColorSpace') || undefined,
    bitDepth: getNumberVal('BitsPerSample') || getNumberVal('BitsPerPixel'),
    channels: getNumberVal('SamplesPerPixel'),
    dpi: getNumberVal('XResolution') && getNumberVal('YResolution')
      ? { x: getNumberVal('XResolution')!, y: getNumberVal('YResolution')! }
      : undefined,
    ppi: getNumberVal('XResolution') && getNumberVal('YResolution')
      ? { x: getNumberVal('XResolution')!, y: getNumberVal('YResolution')! }
      : undefined,
    iccProfile,
    exif: {
      make: getString('Make'),
      model: getString('Model'),
      software: getString('Software'),
      dateTime: getString('DateTime')
        ? new Date(getString('DateTime')!.replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      dateTimeOriginal: getString('DateTimeOriginal')
        ? new Date(getString('DateTimeOriginal')!.replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      dateTimeDigitized: getString('DateTimeDigitized')
        ? new Date(getString('DateTimeDigitized')!.replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      exposureTime: getNumberVal('ExposureTime') ? formatExposureTime(Number(getString('ExposureTime')!)) : undefined,
      fNumber: getString('FNumber') ? formatFNumber(Number(getString('FNumber')!)) : undefined,
      iso: getNumberVal('ISOSpeedRatings'),
      focalLength: getString('FocalLength') ? formatFocalLength(Number(getString('FocalLength')!)) : undefined,
      lensModel: getString('LensModel'),
      flash: getNumberVal('Flash') ? formatFlash(Number(getNumberVal('Flash')!)) : undefined,
      whiteBalance: getNumberVal('WhiteBalance') === 0 ? 'Auto' : getNumberVal('WhiteBalance') === 1 ? 'Manual' : undefined,
      meteringMode: formatMeteringMode(getNumberVal('MeteringMode')),
      exposureMode: getNumberVal('ExposureMode') === 0 ? 'Auto' : getNumberVal('ExposureMode') === 1 ? 'Manual' : getNumberVal('ExposureMode') === 2 ? 'Auto Bracket' : undefined,
      exposureProgram: formatExposureProgram(getNumberVal('ExposureProgram')),
      orientation: getNumberVal('Orientation'),
      gps,
    },
    rawExif: Object.fromEntries(
      Object.entries(tagsMap).map(([k, v]) => [k, v.value])
    ),
  }
}

function formatFlash(flash: number): string {
  const fired = flash & 1
  const mode = (flash >> 1) & 3
  const returnLight = (flash >> 3) & 1
  const redEye = (flash >> 4) & 1

  if (!fired) return 'Did not fire'
  const modes = ['Auto', 'On', 'Off', 'Red-eye reduction']
  return `${modes[mode]} (${returnLight ? 'Return light detected' : 'No return light'}${redEye ? ', Red-eye reduction' : ''})`
}

function formatMeteringMode(mode: number | undefined): string | undefined {
  if (mode === undefined) return undefined
  const modes: Record<number, string> = {
    0: 'Unknown',
    1: 'Average',
    2: 'Center-weighted average',
    3: 'Spot',
    4: 'Multi-spot',
    5: 'Pattern',
    6: 'Partial',
    255: 'Other',
  }
  return modes[mode]
}

function formatExposureProgram(program: number | undefined): string | undefined {
  if (program === undefined) return undefined
  const programs: Record<number, string> = {
    0: 'Not defined',
    1: 'Manual',
    2: 'Normal program',
    3: 'Aperture priority',
    4: 'Shutter priority',
    5: 'Creative program',
    6: 'Action program',
    7: 'Portrait mode',
    8: 'Landscape mode',
  }
  return programs[program]
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
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