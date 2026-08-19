import { describe, expect, it } from 'vitest'
import {
    decodeJwt,
    decodeBase64Url,
    getClaimSummary,
    getExpiryInfo,
    getJwtAlgorithm,
    getJwtTokenType,
    formatDuration
} from '../lib/jwtDecoder'

// Helper to build a valid token for tests
function makeToken(header: Record<string, unknown>, payload: Record<string, unknown>): string {
    const enc = (obj: Record<string, unknown>) => {
        const bytes = new TextEncoder().encode(JSON.stringify(obj))
        let binary = ''
        for (const b of bytes) binary += String.fromCharCode(b)
        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '')
    }
    return `${enc(header)}.${enc(payload)}.signature`
}

describe('JWT Decoder', () => {
    describe('decodeJwt', () => {
        it('decodes header and payload of a valid token', () => {
            const token = makeToken({ alg: 'HS256', typ: 'JWT' }, { sub: '1234567890', name: 'John Doe' })
            const result = decodeJwt(token)
            expect(result.error).toBeNull()
            expect(result.header).toEqual({ alg: 'HS256', typ: 'JWT' })
            expect(result.payload).toEqual({ sub: '1234567890', name: 'John Doe' })
            expect(result.signature).toBe('signature')
        })

        it('handles empty input', () => {
            const result = decodeJwt('')
            expect(result.error).toBe('Empty input')
            expect(result.header).toBeNull()
            expect(result.payload).toBeNull()
        })

        it('handles whitespace-only input', () => {
            const result = decodeJwt('   \n\t  ')
            expect(result.error).toBe('Empty input')
        })

        it('rejects token without 3 segments', () => {
            const result = decodeJwt('a.b')
            expect(result.error).toContain('expected 3 dot-separated segments')
        })

        it('rejects token with 4 segments', () => {
            const result = decodeJwt('a.b.c.d')
            expect(result.error).toContain('expected 3 dot-separated segments')
        })

        it('rejects invalid base64url in header', () => {
            const result = decodeJwt('!!!.eyJzdWIiOiIxIn0.sig')
            expect(result.error).toContain('Invalid header')
        })

        it('rejects non-JSON header', () => {
            const result = decodeJwt('aGVsbG8.eyJzdWIiOiIxIn0.sig')
            expect(result.error).toContain('Invalid header')
        })

        it('rejects non-JSON payload', () => {
            const result = decodeJwt('eyJhbGciOiJIUzI1NiJ9.aGVsbG8.sig')
            expect(result.error).toContain('Invalid payload')
        })

        it('rejects payload that is an array', () => {
            const token = makeToken({ alg: 'none' }, {})
            const payloadArr = btoa('[1,2,3]').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
            const result = decodeJwt(`${token.split('.')[0]}.${payloadArr}.sig`)
            expect(result.error).toContain('Invalid payload')
        })

        it('decodes unicode payload correctly', () => {
            const token = makeToken({ alg: 'HS256' }, { message: 'こんにちは', emoji: '🎉' })
            const result = decodeJwt(token)
            expect(result.error).toBeNull()
            expect(result.payload).toEqual({ message: 'こんにちは', emoji: '🎉' })
        })

        it('trims surrounding whitespace from token', () => {
            const token = makeToken({ alg: 'HS256' }, { sub: '1' })
            const result = decodeJwt(`  ${token}  `)
            expect(result.error).toBeNull()
            expect(result.payload).toEqual({ sub: '1' })
        })
    })

    describe('decodeBase64Url', () => {
        it('decodes base64url with URL-safe characters', () => {
            const input = btoa('hello world').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
            expect(decodeBase64Url(input)).toBe('hello world')
        })

        it('handles missing padding', () => {
            expect(decodeBase64Url('aGVsbG8')).toBe('hello')
        })
    })

    describe('getClaimSummary', () => {
        it('extracts standard claims', () => {
            const summary = getClaimSummary({
                iss: 'https://issuer.example.com',
                sub: 'user-42',
                aud: ['api', 'web'],
                jti: 'abc-123',
                iat: 1000,
                nbf: 2000,
                exp: 3000
            })
            expect(summary).toEqual({
                issuer: 'https://issuer.example.com',
                subject: 'user-42',
                audience: ['api', 'web'],
                jwtId: 'abc-123',
                issuedAt: 1000,
                notBefore: 2000,
                expiresAt: 3000
            })
        })

        it('returns nulls for missing claims', () => {
            const summary = getClaimSummary({ sub: '1' })
            expect(summary.issuer).toBeNull()
            expect(summary.audience).toBeNull()
            expect(summary.expiresAt).toBeNull()
        })

        it('handles null payload', () => {
            const summary = getClaimSummary(null)
            expect(summary.subject).toBeNull()
            expect(summary.expiresAt).toBeNull()
        })
    })

    describe('getExpiryInfo', () => {
        const now = 100000 * 1000 // fixed "now" in ms

        it('reports no expiry when exp is missing', () => {
            const info = getExpiryInfo({ sub: '1' }, now)
            expect(info.status).toBe('no-expiry')
        })

        it('reports expired when exp is in the past', () => {
            const info = getExpiryInfo({ exp: 99999 }, now)
            expect(info.status).toBe('expired')
            expect(info.label).toContain('ago')
        })

        it('reports valid when exp is in the future', () => {
            const info = getExpiryInfo({ exp: 100600 }, now)
            expect(info.status).toBe('valid')
            expect(info.label).toContain('Valid for')
        })

        it('returns a formatted expiry date', () => {
            const info = getExpiryInfo({ exp: 100600 }, now)
            expect(info.expiresAtDate).not.toBeNull()
        })
    })

    describe('helpers', () => {
        it('returns algorithm from header', () => {
            expect(getJwtAlgorithm({ alg: 'RS256' })).toBe('RS256')
            expect(getJwtAlgorithm(null)).toBe('Unknown')
        })

        it('returns token type from header', () => {
            expect(getJwtTokenType({ typ: 'JWT' })).toBe('JWT')
            expect(getJwtTokenType({ typ: 'at+jwt' })).toBe('at+jwt')
            expect(getJwtTokenType(null)).toBe('JWT')
        })

        it('formats durations', () => {
            expect(formatDuration(30)).toBe('30s')
            expect(formatDuration(120)).toBe('2m')
            expect(formatDuration(3661)).toBe('1h')
            expect(formatDuration(90000)).toBe('1d 1h')
        })
    })
})