export interface MetadataRow {
    label: string
    value: string
}

export interface MetadataGroup {
    title: string
    rows: MetadataRow[]
}

export interface GpsCoordinates {
    latitude: number
    longitude: number
}

export interface ImageMetadata {
    name: string
    size: number
    sizeLabel: string
    type: string
    width: number | null
    height: number | null
    gps: GpsCoordinates | null
    groups: MetadataGroup[]
}

type ExifrOutput = Record<string, unknown>

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    const i = Math.min(Math.floor(Math.log2(bytes) / 10), units.length - 1)
    const value = bytes / 2 ** (10 * i)
    return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatExposure(seconds: unknown): string | null {
    if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0) return null
    if (seconds < 1) {
        const denom = Math.round(1 / seconds)
        return `1/${denom} s`
    }
    return `${seconds.toFixed(seconds < 10 ? 1 : 0)} s`
}

export function formatFocalLength(mm: unknown): string | null {
    if (typeof mm !== 'number' || !Number.isFinite(mm) || mm <= 0) return null
    return `${mm.toFixed(mm < 10 ? 1 : 0)} mm`
}

export function formatAperture(fNumber: unknown): string | null {
    if (typeof fNumber !== 'number' || !Number.isFinite(fNumber) || fNumber <= 0) return null
    return `f/${fNumber.toFixed(fNumber >= 10 ? 1 : 2)}`
}

export function formatGps(latitude: number, longitude: number): string {
    const lat = `${Math.abs(latitude).toFixed(6)}° ${latitude >= 0 ? 'N' : 'S'}`
    const lon = `${Math.abs(longitude).toFixed(6)}° ${longitude >= 0 ? 'E' : 'W'}`
    return `${lat}, ${lon}`
}

export function formatGpsDms(value: unknown, ref: unknown): string | null {
    if (!Array.isArray(value) || value.length < 3) return null
    const [deg, min, sec] = value.map((v) => (typeof v === 'number' ? v : 0))
    const direction = typeof ref === 'string' ? ref : ''
    return `${deg}° ${min}' ${sec.toFixed(2)}" ${direction}`.trim()
}

export function formatDate(value: unknown): string | null {
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value.toLocaleString()
    }
    if (typeof value === 'string' && value.trim()) {
        const parsed = new Date(value)
        if (!isNaN(parsed.getTime())) return parsed.toLocaleString()
        return value
    }
    if (typeof value === 'number') {
        const parsed = new Date(value)
        return isNaN(parsed.getTime()) ? null : parsed.toLocaleString()
    }
    return null
}

interface TagDef {
    key: string
    label: string
    format?: (value: unknown, output: ExifrOutput) => string | null
}

const FILE_GROUP: TagDef[] = [
    { key: 'name', label: 'Name' },
    { key: 'sizeLabel', label: 'Size' },
    { key: 'type', label: 'Type' },
    { key: 'dimensions', label: 'Dimensions', format: (v) => (typeof v === 'string' ? v : null) },
]

const CAMERA_GROUP: TagDef[] = [
    { key: 'Make', label: 'Camera Make' },
    { key: 'Model', label: 'Camera Model' },
    { key: 'LensModel', label: 'Lens Model' },
    { key: 'Software', label: 'Software' },
    { key: 'DateTimeOriginal', label: 'Date Taken', format: (v) => formatDate(v) },
    { key: 'CreateDate', label: 'Digitized', format: (v) => formatDate(v) },
    { key: 'FNumber', label: 'Aperture', format: (v) => formatAperture(v) },
    { key: 'ExposureTime', label: 'Exposure', format: (v) => formatExposure(v) },
    { key: 'ISO', label: 'ISO' },
    { key: 'FocalLength', label: 'Focal Length', format: (v) => formatFocalLength(v) },
    { key: 'FocalLengthIn35mmFormat', label: 'Focal Length (35mm)', format: (v) => formatFocalLength(v) },
    { key: 'ExposureProgram', label: 'Exposure Program' },
    { key: 'MeteringMode', label: 'Metering Mode' },
    { key: 'WhiteBalance', label: 'White Balance' },
    { key: 'Flash', label: 'Flash' },
    { key: 'Orientation', label: 'Orientation' },
]

const GPS_GROUP: TagDef[] = [
    { key: 'latitude', label: 'Latitude', format: (v) => (typeof v === 'number' ? `${Math.abs(v).toFixed(6)}° ${v >= 0 ? 'N' : 'S'}` : null) },
    { key: 'longitude', label: 'Longitude', format: (v) => (typeof v === 'number' ? `${Math.abs(v).toFixed(6)}° ${v >= 0 ? 'E' : 'W'}` : null) },
    { key: 'GPSLatitude', label: 'Latitude (DMS)', format: (v, o) => formatGpsDms(v, o.GPSLatitudeRef) },
    { key: 'GPSLongitude', label: 'Longitude (DMS)', format: (v, o) => formatGpsDms(v, o.GPSLongitudeRef) },
    { key: 'GPSAltitude', label: 'Altitude (m)' },
    { key: 'GPSImgDirection', label: 'Direction' },
    { key: 'GPSSpeed', label: 'Speed' },
    { key: 'GPSDateStamp', label: 'Date', format: (v) => formatDate(v) },
    { key: 'GPSTimeStamp', label: 'Time', format: (v) => formatDate(v) },
]

const IPTC_GROUP: TagDef[] = [
    { key: 'Headline', label: 'Headline' },
    { key: 'Caption', label: 'Caption' },
    { key: 'Keywords', label: 'Keywords', format: (v) => (Array.isArray(v) ? v.join(', ') : typeof v === 'string' ? v : null) },
    { key: 'Copyright', label: 'Copyright' },
    { key: 'Credit', label: 'Credit' },
    { key: 'Byline', label: 'Byline' },
    { key: 'City', label: 'City' },
    { key: 'State', label: 'State' },
    { key: 'Country', label: 'Country' },
]

const ICC_GROUP: TagDef[] = [
    { key: 'profileDescription', label: 'Color Profile' },
    { key: 'ProfileDescription', label: 'Color Profile' },
]

const XMP_GROUP: TagDef[] = [
    { key: 'Description', label: 'Description' },
    { key: 'Creator', label: 'Creator' },
    { key: 'Rights', label: 'Rights' },
    { key: 'Title', label: 'Title' },
]

function buildGroup(title: string, defs: TagDef[], output: ExifrOutput, file: { name: string; size: number; type: string; width: number | null; height: number | null }): MetadataGroup {
    const rows: MetadataRow[] = []
    for (const def of defs) {
        let value: unknown
        if (def.key === 'name') value = file.name
        else if (def.key === 'sizeLabel') value = formatBytes(file.size)
        else if (def.key === 'type') value = file.type
        else if (def.key === 'dimensions') value = file.width && file.height ? `${file.width} × ${file.height} px` : null
        else value = output[def.key]

        if (value === undefined || value === null) continue
        const formatted = def.format ? def.format(value, output) : stringifyValue(value)
        if (formatted !== null && formatted !== '') {
            rows.push({ label: def.label, value: formatted })
        }
    }
    return rows.length > 0 ? { title, rows } : { title, rows }
}

function stringifyValue(value: unknown): string {
    if (typeof value === 'string') return value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    if (Array.isArray(value)) return value.join(', ')
    if (value instanceof Date) return formatDate(value) ?? String(value)
    return ''
}

export interface NormalizeInput {
    name: string
    size: number
    type: string
    width: number | null
    height: number | null
    output: ExifrOutput
}

export function normalizeMetadata(input: NormalizeInput): ImageMetadata {
    const { name, size, type, width, height, output } = input
    const file = { name, size, type, width, height }

    const gps =
        typeof output.latitude === 'number' && typeof output.longitude === 'number'
            ? { latitude: output.latitude, longitude: output.longitude }
            : null

    const groups: MetadataGroup[] = []
    const fileGroup = buildGroup('File', FILE_GROUP, output, file)
    if (fileGroup.rows.length > 0) groups.push(fileGroup)
    const cameraGroup = buildGroup('Camera', CAMERA_GROUP, output, file)
    if (cameraGroup.rows.length > 0) groups.push(cameraGroup)
    const gpsGroup = buildGroup('Location', GPS_GROUP, output, file)
    if (gpsGroup.rows.length > 0) groups.push(gpsGroup)
    const iptcGroup = buildGroup('Description', IPTC_GROUP, output, file)
    if (iptcGroup.rows.length > 0) groups.push(iptcGroup)
    const iccGroup = buildGroup('Color', ICC_GROUP, output, file)
    if (iccGroup.rows.length > 0) groups.push(iccGroup)
    const xmpGroup = buildGroup('Rights', XMP_GROUP, output, file)
    if (xmpGroup.rows.length > 0) groups.push(xmpGroup)

    return {
        name,
        size,
        sizeLabel: formatBytes(size),
        type,
        width,
        height,
        gps,
        groups,
    }
}

export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exifr = (await import('exifr')) as any

    const [output] = await Promise.all([
        exifr.parse(file, { full: true, exif: true, iptc: true, icc: true, xmp: true }),
    ])

    const { width, height } = await readImageSize(file)

    return normalizeMetadata({
        name: file.name,
        size: file.size,
        type: file.type,
        width,
        height,
        output: (output ?? {}) as ExifrOutput,
    })
}

export function readImageSize(file: File): Promise<{ width: number | null; height: number | null }> {
    return new Promise((resolve) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            resolve({ width: img.naturalWidth, height: img.naturalHeight })
            URL.revokeObjectURL(url)
        }
        img.onerror = () => {
            resolve({ width: null, height: null })
            URL.revokeObjectURL(url)
        }
        img.src = url
    })
}