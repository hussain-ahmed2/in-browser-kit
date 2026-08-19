export interface JwtDecodeResult {
    header: Record<string, unknown> | null
    payload: Record<string, unknown> | null
    signature: string
    error: string | null
}

const BASE64URL_REGEX = /^[A-Za-z0-9_-]+$/

export function decodeBase64Url(input: string): string {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
    return new TextDecoder().decode(bytes)
}

function parseSegment(segment: string, label: string): Record<string, unknown> | null {
    if (!BASE64URL_REGEX.test(segment)) {
        throw new Error(`Invalid ${label}: not valid Base64URL`)
    }
    let decoded: string
    try {
        decoded = decodeBase64Url(segment)
    } catch {
        throw new Error(`Invalid ${label}: not valid Base64URL`)
    }
    try {
        const parsed = JSON.parse(decoded)
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error('not an object')
        }
        return parsed as Record<string, unknown>
    } catch {
        throw new Error(`Invalid ${label}: not valid JSON`)
    }
}

export function decodeJwt(token: string): JwtDecodeResult {
    const trimmed = token.trim()

    if (!trimmed) {
        return { header: null, payload: null, signature: '', error: 'Empty input' }
    }

    const parts = trimmed.split('.')
    if (parts.length !== 3) {
        return {
            header: null,
            payload: null,
            signature: '',
            error: `Invalid JWT: expected 3 dot-separated segments, found ${parts.length}`
        }
    }

    const [headerSegment, payloadSegment, signatureSegment] = parts

    try {
        const header = parseSegment(headerSegment, 'header')
        const payload = parseSegment(payloadSegment, 'payload')
        return { header, payload, signature: signatureSegment, error: null }
    } catch (e) {
        return {
            header: null,
            payload: null,
            signature: '',
            error: e instanceof Error ? e.message : 'Failed to decode JWT'
        }
    }
}

export interface JwtClaimSummary {
    issuer: string | null
    subject: string | null
    audience: string | string[] | null
    jwtId: string | null
    issuedAt: number | null
    notBefore: number | null
    expiresAt: number | null
}

export function getClaimSummary(payload: Record<string, unknown> | null): JwtClaimSummary {
    if (!payload) {
        return {
            issuer: null,
            subject: null,
            audience: null,
            jwtId: null,
            issuedAt: null,
            notBefore: null,
            expiresAt: null
        }
    }

    const asString = (v: unknown): string | null => (typeof v === 'string' ? v : null)
    const asNumber = (v: unknown): number | null => (typeof v === 'number' ? v : null)

    return {
        issuer: asString(payload.iss),
        subject: asString(payload.sub),
        audience: typeof payload.aud === 'string' ? payload.aud : Array.isArray(payload.aud) ? payload.aud.map(String) : null,
        jwtId: asString(payload.jti),
        issuedAt: asNumber(payload.iat),
        notBefore: asNumber(payload.nbf),
        expiresAt: asNumber(payload.exp)
    }
}

export type ExpiryStatus = 'expired' | 'valid' | 'no-expiry'

export interface ExpiryInfo {
    status: ExpiryStatus
    label: string
    expiresAtDate: string | null
}

export function getExpiryInfo(payload: Record<string, unknown> | null, now: number = Date.now()): ExpiryInfo {
    const { expiresAt } = getClaimSummary(payload)

    if (expiresAt === null) {
        return { status: 'no-expiry', label: 'No expiry (exp) claim', expiresAtDate: null }
    }

    const expMs = expiresAt * 1000
    const dateLabel = new Date(expMs).toLocaleString()
    const diffSeconds = Math.round((expMs - now) / 1000)

    if (diffSeconds < 0) {
        const past = Math.abs(diffSeconds)
        return {
            status: 'expired',
            label: `Expired ${formatDuration(past)} ago`,
            expiresAtDate: dateLabel
        }
    }

    return {
        status: 'valid',
        label: `Valid for ${formatDuration(diffSeconds)}`,
        expiresAtDate: dateLabel
    }
}

export function formatDuration(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60)
    if (minutes < 1) return `${totalSeconds}s`
    const hours = Math.floor(minutes / 60)
    if (hours < 1) return `${minutes}m`
    const days = Math.floor(hours / 24)
    if (days < 1) return `${hours}h`
    return `${days}d ${hours % 24}h`
}

export function getJwtAlgorithm(header: Record<string, unknown> | null): string {
    return header && typeof header.alg === 'string' ? header.alg : 'Unknown'
}

export function getJwtTokenType(header: Record<string, unknown> | null): string {
    return header && typeof header.typ === 'string' ? header.typ : 'JWT'
}