import { describe, expect, it } from 'vitest'
import {
    generateUuid,
    generateUuids,
    validateUuid
} from '../lib/uuidGenerator'

describe('UUID Generator', () => {
    describe('generateUuid', () => {
        it('generates valid v4 UUIDs', () => {
            const uuid = generateUuid('v4')
            expect(validateUuid(uuid)).toBe(true)
            expect(uuid.split('-')).toHaveLength(5)
        })

        it('generates valid v1 UUIDs', () => {
            const uuid = generateUuid('v1')
            expect(validateUuid(uuid)).toBe(true)
            expect(uuid.split('-')).toHaveLength(5)
        })

        it('generates valid v7 UUIDs', () => {
            const uuid = generateUuid('v7')
            expect(validateUuid(uuid)).toBe(true)
            expect(uuid.split('-')).toHaveLength(5)
        })

        it('generates different UUIDs on each call', () => {
            const uuids = new Set()
            for (let i = 0; i < 100; i++) {
                uuids.add(generateUuid('v4'))
            }
            expect(uuids.size).toBe(100)
        })

        it('generates uppercase when requested', () => {
            const uuid = generateUuid('v4', true)
            expect(uuid).toBe(uuid.toUpperCase())
        })

        it('generates lowercase by default', () => {
            const uuid = generateUuid('v4', false)
            expect(uuid).toBe(uuid.toLowerCase())
        })
    })

    describe('generateUuids', () => {
        it('generates correct count of UUIDs', () => {
            const results = generateUuids({ version: 'v4', count: 5, uppercase: false, includeBraces: false, includeHyphens: true })
            expect(results).toHaveLength(5)
        })

        it('generates unique UUIDs', () => {
            const results = generateUuids({ version: 'v4', count: 100, uppercase: false, includeBraces: false, includeHyphens: true })
            const uuids = new Set(results.map(r => r.uuid))
            expect(uuids.size).toBe(100)
        })

        it('includes braces when requested', () => {
            const results = generateUuids({ version: 'v4', count: 5, uppercase: false, includeBraces: true, includeHyphens: true })
            for (const r of results) {
                expect(r.uuid.startsWith('{')).toBe(true)
                expect(r.uuid.endsWith('}')).toBe(true)
            }
        })

        it('excludes hyphens when requested', () => {
            const results = generateUuids({ version: 'v4', count: 5, uppercase: false, includeBraces: false, includeHyphens: false })
            for (const r of results) {
                expect(r.uuid.includes('-')).toBe(false)
                expect(r.uuid.length).toBe(32)
            }
        })

        it('includes both braces and no hyphens', () => {
            const results = generateUuids({ version: 'v4', count: 5, uppercase: false, includeBraces: true, includeHyphens: false })
            for (const r of results) {
                expect(r.uuid.startsWith('{')).toBe(true)
                expect(r.uuid.endsWith('}')).toBe(true)
                expect(r.uuid.slice(1, -1).includes('-')).toBe(false)
            }
        })

        it('generates uppercase when requested', () => {
            const results = generateUuids({ version: 'v4', count: 5, uppercase: true, includeBraces: false, includeHyphens: true })
            for (const r of results) {
                expect(r.uuid).toBe(r.uuid.toUpperCase())
            }
        })

        it('includes version in result', () => {
            const results = generateUuids({ version: 'v1', count: 3, uppercase: false, includeBraces: false, includeHyphens: true })
            for (const r of results) {
                expect(r.version).toBe('v1')
            }
        })
    })

    describe('validateUuid', () => {
        it('returns true for valid UUIDs', () => {
            expect(validateUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
            expect(validateUuid('123E4567-E89B-12D3-A456-426614174000')).toBe(true)
            expect(validateUuid('{123e4567-e89b-12d3-a456-426614174000}')).toBe(true)
        })

        it('returns false for invalid UUIDs', () => {
            expect(validateUuid('not-a-uuid')).toBe(false)
            expect(validateUuid('123e4567-e89b-12d3-a456')).toBe(false)
            expect(validateUuid('123e4567-e89b-12d3-a456-4266141740000')).toBe(false)
            expect(validateUuid('')).toBe(false)
            expect(validateUuid('gggggggg-gggg-gggg-gggg-gggggggggggg')).toBe(false)
        })

        it('handles UUIDs with braces', () => {
            expect(validateUuid('{123e4567-e89b-12d3-a456-426614174000}')).toBe(true)
        })
    })

    describe('version-specific format', () => {
        it('v4 has version digit 4', () => {
            for (let i = 0; i < 20; i++) {
                const uuid = generateUuid('v4')
                const parts = uuid.split('-')
                expect(parts[2][0]).toBe('4')
            }
        })

        it('v1 has version digit 1', () => {
            for (let i = 0; i < 20; i++) {
                const uuid = generateUuid('v1')
                const parts = uuid.split('-')
                expect(parts[2][0]).toBe('1')
            }
        })

        it('v7 has version digit 7', () => {
            for (let i = 0; i < 20; i++) {
                const uuid = generateUuid('v7')
                const parts = uuid.split('-')
                expect(parts[2][0]).toBe('7')
            }
        })
    })
})