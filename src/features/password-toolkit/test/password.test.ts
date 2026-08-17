import { describe, expect, it } from 'vitest'
import {
    estimateEntropy,
    generatePassword,
    scorePassword,
    STRENGTH_LABELS,
    type PasswordOptions
} from '../lib/password'

const CHARSETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/~'
} as const

const ALL_CHARS = Object.values(CHARSETS).join('')
const AMBIGUOUS = /[il1LoO0|]/

function everyCharFrom(chars: string, pool: string): boolean {
    return [...chars].every((char) => pool.includes(char))
}

describe('generatePassword', () => {
    const defaults: PasswordOptions = {
        length: 16,
        useLowercase: true,
        useUppercase: true,
        useDigits: true,
        useSymbols: true,
        excludeAmbiguous: false
    }

    it('returns a string of the requested length', () => {
        for (const length of [1, 8, 16, 64]) {
            expect(generatePassword({ ...defaults, length })).toHaveLength(
                length
            )
        }
    })

    it('includes at least one character from each enabled set', () => {
        for (let i = 0; i < 20; i++) {
            const password = generatePassword(defaults)
            expect(/[a-z]/.test(password)).toBe(true)
            expect(/[A-Z]/.test(password)).toBe(true)
            expect(/[0-9]/.test(password)).toBe(true)
            expect(/[^a-zA-Z0-9]/.test(password)).toBe(true)
        }
    })

    it('never uses characters from disabled sets', () => {
        const options: PasswordOptions = {
            ...defaults,
            useUppercase: false,
            useSymbols: false
        }
        for (let i = 0; i < 20; i++) {
            const password = generatePassword(options)
            expect(everyCharFrom(password, `${CHARSETS.lowercase}${CHARSETS.digits}`)).toBe(
                true
            )
            expect(/[A-Z]/.test(password)).toBe(false)
            expect(/[^a-zA-Z0-9]/.test(password)).toBe(false)
        }
    })

    it('excludes ambiguous characters when requested', () => {
        const options: PasswordOptions = {
            ...defaults,
            excludeAmbiguous: true
        }
        for (let i = 0; i < 20; i++) {
            expect(generatePassword(options)).not.toMatch(AMBIGUOUS)
        }
    })

    it('returns an empty string when no character sets are enabled', () => {
        const options: PasswordOptions = {
            ...defaults,
            useLowercase: false,
            useUppercase: false,
            useDigits: false,
            useSymbols: false
        }
        expect(generatePassword(options)).toBe('')
    })

    it('clamps length to the supported range', () => {
        expect(generatePassword({ ...defaults, length: 0 })).toHaveLength(1)
        expect(generatePassword({ ...defaults, length: -5 })).toHaveLength(1)
        expect(generatePassword({ ...defaults, length: 2048 })).toHaveLength(
            1024
        )
    })

    it('produces varied output across invocations', () => {
        const seen = new Set<string>()
        for (let i = 0; i < 50; i++) seen.add(generatePassword(defaults))
        expect(seen.size).toBeGreaterThan(1)
    })

    it('only uses characters from the enabled pools', () => {
        for (let i = 0; i < 20; i++) {
            const password = generatePassword(defaults)
            expect(everyCharFrom(password, ALL_CHARS)).toBe(true)
        }
    })
})

describe('estimateEntropy', () => {
    it('returns 0 for an empty password', () => {
        expect(estimateEntropy('')).toBe(0)
    })

    it('computes expected entropy for known passwords', () => {
        // 10-character numeric password: 10 * log2(10)
        expect(estimateEntropy('0123456789')).toBeCloseTo(10 * Math.log2(10))
        // 8-character lowercase password: 8 * log2(26)
        expect(estimateEntropy('abcdefgh')).toBeCloseTo(8 * Math.log2(26))
        // 12-char lowercase + digits: 12 * log2(36)
        expect(estimateEntropy('a1b2c3d4e5f6')).toBeCloseTo(12 * Math.log2(36))
        // 16-char with symbols: 16 * log2(94)
        expect(estimateEntropy('P@ssw0rd!2024$OK')).toBeCloseTo(
            16 * Math.log2(94)
        )
    })

    it('detects the widest used character class', () => {
        expect(estimateEntropy('aB3!')).toBeCloseTo(4 * Math.log2(94))
    })
})

describe('scorePassword', () => {
    it('scores an empty password as Very Weak with no suggestions', () => {
        const result = scorePassword('')
        expect(result.score).toBe(0)
        expect(result.label).toBe(STRENGTH_LABELS[0])
        expect(result.suggestions).toEqual([])
    })

    it('assigns monotonically increasing scores to stronger passwords', () => {
        const weak = scorePassword('abc123')
        const strong = scorePassword('CorrectHorseBatteryStaple!2024')
        expect(weak.score).toBeLessThanOrEqual(strong.score)
    })

    it('scores a very strong password as 4 (Very Strong)', () => {
        const result = scorePassword('xK9$vP2!qR7@mN4#zW6')
        expect(result.score).toBe(4)
        expect(result.label).toBe(STRENGTH_LABELS[4])
    })

    it('suggests a longer password for short inputs', () => {
        const result = scorePassword('abc123')
        expect(result.suggestions.some((s) => s.includes('12 characters'))).toBe(
            true
        )
    })

    it('suggests mixing character classes for single-class passwords', () => {
        const result = scorePassword('alllowercaseonly')
        expect(
            result.suggestions.some((s) => s.includes('single character class'))
        ).toBe(true)
    })

    it('flags repeated characters', () => {
        const result = scorePassword('aaaB3!')
        expect(
            result.suggestions.some((s) => s.includes('repeating'))
        ).toBe(true)
    })

    it('always returns a label matching the score', () => {
        const passwords = ['', 'abc123', 'aB3!xY7@q', 'P@ssw0rd!2024$OK']
        for (const password of passwords) {
            const result = scorePassword(password)
            expect(result.label).toBe(STRENGTH_LABELS[result.score])
        }
    })
})