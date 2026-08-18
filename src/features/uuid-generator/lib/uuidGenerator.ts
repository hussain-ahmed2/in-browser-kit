export type UuidVersion = 'v1' | 'v4' | 'v7'

export interface UuidOptions {
    version: UuidVersion
    count: number
    uppercase: boolean
    includeBraces: boolean
    includeHyphens: boolean
}

export interface GeneratedUuid {
    uuid: string
    version: UuidVersion
}

const HEX_CHARS = '0123456789abcdef'
const HEX_CHARS_UPPER = '0123456789ABCDEF'

function randomHex(length: number, uppercase = false): string {
    const chars = uppercase ? HEX_CHARS_UPPER : HEX_CHARS
    let result = ''
    const randomValues = new Uint8Array(length)
    crypto.getRandomValues(randomValues)
    for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % 16]
    }
    return result
}

function generateV4(uppercase = false): string {
    const hex = randomHex(32, uppercase)
    const variantValues = uppercase ? ['8', '9', 'A', 'B'] : ['8', '9', 'a', 'b']
    const variantChar = variantValues[crypto.getRandomValues(new Uint8Array(1))[0] % 4]
    const uuid = [
        hex.slice(0, 8),
        hex.slice(8, 12),
        '4' + hex.slice(13, 16),
        variantChar + hex.slice(17, 20),
        hex.slice(20, 32)
    ].join('-')
    return uuid
}

function generateV1(uppercase = false): string {
    const now = Date.now()
    const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0')
    const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0')
    const timeHiAndVersion = ((now >> 48) & 0x0fff | 0x1000).toString(16).padStart(4, '0')
    const clockSeq = (0x8000 | (crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff)).toString(16).padStart(4, '0')
    const node = randomHex(12, uppercase)
    const uuid = [timeLow, timeMid, timeHiAndVersion, clockSeq, node].join('-')
    return uppercase ? uuid.toUpperCase() : uuid
}

function generateV7(uppercase = false): string {
    const now = Date.now()
    const timestampHex = (BigInt(now) << 16n).toString(16).padStart(16, '0')
    const timeLow = timestampHex.slice(0, 8)
    const timeMid = timestampHex.slice(8, 12)
    const timeHi = timestampHex.slice(12, 16)
    const timeHiAndVersion = '7' + timeHi.slice(1)
    const randomPart = randomHex(16, uppercase)
    const clockSeqHi = (parseInt(randomPart.slice(0, 2), 16) & 0x3f | 0x80).toString(16).padStart(2, '0')
    const uuid = [
        timeLow,
        timeMid,
        timeHiAndVersion,
        clockSeqHi + randomPart.slice(2, 4),
        randomPart.slice(4, 16)
    ].join('-')
    return uppercase ? uuid.toUpperCase() : uuid
}

export function generateUuid(version: UuidVersion, uppercase = false): string {
    switch (version) {
        case 'v1':
            return generateV1(uppercase)
        case 'v4':
            return generateV4(uppercase)
        case 'v7':
            return generateV7(uppercase)
        default:
            return generateV4(uppercase)
    }
}

export function generateUuids(options: UuidOptions): GeneratedUuid[] {
    const results: GeneratedUuid[] = []
    for (let i = 0; i < options.count; i++) {
        let uuid = generateUuid(options.version, options.uppercase)
        if (!options.includeHyphens) {
            uuid = uuid.replace(/-/g, '')
        }
        if (options.includeBraces) {
            uuid = `{${uuid}}`
        }
        results.push({ uuid, version: options.version })
    }
    return results
}

export function validateUuid(uuid: string): boolean {
    const cleanUuid = uuid.replace(/[{}]/g, '')
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-7][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(cleanUuid)
}