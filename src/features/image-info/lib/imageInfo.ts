import * as ExifReader from 'exifr'

export interface ImageInfo {
  // Basic info
  fileName: string
  fileSize: number
  mimeType: string
  width: number
  height: number
  aspectRatio: string

  // Color info
  colorSpace?: string
  bitDepth?: number
  channels?: number

  // DPI
  dpi?: { x: number; y: number }
  ppi?: { x: number; y: number }

  // ICC Profile
  iccProfile?: {
    description?: string
    manufacturer?: string
    model?: string
    colorSpace?: string
    renderingIntent?: number
    connectionSpace?: string
  }

  // EXIF
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

  // Raw EXIF (all tags)
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
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)

  // Get basic image dimensions
  const dimensions = await getImageDimensions(file)

  // Parse EXIF with exifr - use any to bypass TypeScript issues with exifr's complex types
  // @ts-expect-error - exifr's TypeScript types are overly restrictive
  const exif = await ExifReader.parse(uint8Array, {
    ifd0: true,
    exif: true,
    gps: true,
    interop: true,
    iptc: false,
    xmp: false,
    icc: true,
    jfif: true,
    tiff: true,
  }) as Record<string, unknown>

  // Type assertion for exif with GPS and ICCProfile
  const exifRaw = exif as Record<string, unknown> & { gps?: Record<string, unknown>; ICCProfile?: Record<string, unknown> }

  // Extract ICC profile info
  let iccProfile: ImageInfo['iccProfile'] = undefined
  const iccProfileRaw = exifRaw.ICCProfile as Record<string, unknown> | undefined
  if (iccProfileRaw) {
    iccProfile = {
      description: iccProfileRaw.description as string | undefined,
      manufacturer: iccProfileRaw.manufacturer as string | undefined,
      model: iccProfileRaw.model as string | undefined,
      colorSpace: iccProfileRaw.colorSpaceType as string | undefined,
      renderingIntent: iccProfileRaw.renderingIntent as number | undefined,
      connectionSpace: iccProfileRaw.connectionSpace as string | undefined,
    }
  }

// Extract GPS info
  let gps: { latitude?: number; longitude?: number; altitude?: number; latitudeRef?: string; longitudeRef?: string } | undefined = undefined
  const gpsRaw = exifRaw.gps as Record<string, unknown> | undefined
  if (gpsRaw) {
    const lat = gpsRaw.GPSLatitude as number[] | undefined
    const lon = gpsRaw.GPSLongitude as number[] | undefined
    const latRef = gpsRaw.GPSLatitudeRef as string | undefined
    const lonRef = gpsRaw.GPSLongitudeRef as string | undefined
    const alt = gpsRaw.GPSAltitude as number | undefined

    if (lat && lon) {
      const convertDMS = (dms: number[], ref: string) => {
        const degrees = dms[0]
        const minutes = dms[1]
        const seconds = dms[2]
        let decimal = degrees + minutes / 60 + seconds / 3600
        if (ref === 'S' || ref === 'W') decimal = -decimal
        return decimal
      }

      gps = {
        latitude: convertDMS(lat, latRef || 'N'),
        longitude: convertDMS(lon, lonRef || 'E'),
        altitude: alt,
        latitudeRef: latRef,
        longitudeRef: lonRef,
      }
    }
  }

  // Helper to safely get string values
  const getString = (val: unknown): string | undefined => {
    if (val === undefined || val === null) return undefined
    return String(val)
  }

  // Helper to safely get number values
  const getNumber = (val: unknown): number | undefined => {
    if (val === undefined || val === null) return undefined
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

  return {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    aspectRatio: formatAspectRatio(dimensions.width, dimensions.height),
    colorSpace: exifRaw.ColorSpace === 1 ? 'sRGB' : exifRaw.ColorSpace === 65535 ? 'Uncalibrated' : 'Unknown',
    bitDepth: getNumber((exifRaw.BitsPerSample as number[])?.[0]) || getNumber(exifRaw.BitsPerPixel),
    channels: getNumber(exifRaw.SamplesPerPixel),
    dpi: exifRaw.XResolution && exifRaw.YResolution
      ? { x: Number(exifRaw.XResolution), y: Number(exifRaw.YResolution) }
      : undefined,
    ppi: exifRaw.XResolution && exifRaw.YResolution
      ? { x: Number(exifRaw.XResolution), y: Number(exifRaw.YResolution) }
      : undefined,
    iccProfile,
    exif: {
      make: getString(exifRaw.Make),
      model: getString(exifRaw.Model),
      software: getString(exifRaw.Software),
      dateTime: exifRaw.DateTime
        ? new Date(String(exifRaw.DateTime).replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      dateTimeOriginal: exifRaw.DateTimeOriginal
        ? new Date(String(exifRaw.DateTimeOriginal).replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      dateTimeDigitized: exifRaw.DateTimeDigitized
        ? new Date(String(exifRaw.DateTimeDigitized).replace(':', '-').replace(':', '-')).toLocaleString()
        : undefined,
      exposureTime: exifRaw.ExposureTime ? formatExposureTime(Number(exifRaw.ExposureTime)) : undefined,
      fNumber: exifRaw.FNumber ? formatFNumber(Number(exifRaw.FNumber)) : undefined,
      iso: (() => {
      const val = exifRaw.ISOSpeedRatings;
      if (val === undefined || val === null) return undefined;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const n = Number(val);
        return isNaN(n) ? undefined : n;
      }
      if (Array.isArray(val) && val.length > 0) {
        const n = Number(val[0]);
        return isNaN(n) ? undefined : n;
      }
      return undefined;
    })(),
      focalLength: exifRaw.FocalLength ? formatFocalLength(Number(exifRaw.FocalLength)) : undefined,
      lensModel: getString(exifRaw.LensModel),
      flash: exifRaw.Flash ? formatFlash(Number(exifRaw.Flash)) : undefined,
      whiteBalance: exifRaw.WhiteBalance === 0 ? 'Auto' : exifRaw.WhiteBalance === 1 ? 'Manual' : undefined,
      meteringMode: formatMeteringMode(exifRaw.MeteringMode as number | undefined),
      exposureMode: exifRaw.ExposureMode === 0 ? 'Auto' : exifRaw.ExposureMode === 1 ? 'Manual' : exifRaw.ExposureMode === 2 ? 'Auto Bracket' : undefined,
      exposureProgram: formatExposureProgram(exifRaw.ExposureProgram as number | undefined),
      orientation: exifRaw.Orientation as number | undefined,
      gps: gps,
    },
    rawExif: exif,
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