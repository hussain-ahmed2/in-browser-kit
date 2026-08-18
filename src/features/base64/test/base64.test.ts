import { describe, expect, it } from 'vitest'
import {
    encodeText,
    decodeText,
    encodeFile,
    decodeFile,
    validateBase64
} from '../lib/base64'

describe('Base64 encoding/decoding', () => {
    describe('encodeText / decodeText', () => {
        it('encodes and decodes ASCII text', () => {
            const original = 'Hello, World!'
            const encoded = encodeText(original)
            const decoded = decodeText(encoded)
            expect(decoded).toBe(original)
        })

        it('encodes and decodes Unicode text', () => {
            const original = 'こんにちは世界 🌍'
            const encoded = encodeText(original)
            const decoded = decodeText(encoded)
            expect(decoded).toBe(original)
        })

        it('encodes and decodes empty string', () => {
            const original = ''
            const encoded = encodeText(original)
            const decoded = decodeText(encoded)
            expect(decoded).toBe(original)
        })

        it('encodes and decodes special characters', () => {
            const original = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
            const encoded = encodeText(original)
            const decoded = decodeText(encoded)
            expect(decoded).toBe(original)
        })

        it('handles newlines and tabs', () => {
            const original = 'Line 1\nLine 2\tTabbed\r\nWindows'
            const encoded = encodeText(original)
            const decoded = decodeText(encoded)
            expect(decoded).toBe(original)
        })
    })

    describe('encodeFile / decodeFile', () => {
        it('encodes and decodes a file', async () => {
            const content = 'File content with unicode: こんにちは'
            const file = new File([content], 'test.txt', { type: 'text/plain' })

            const base64 = await encodeFile(file)
            expect(typeof base64).toBe('string')
            expect(base64.length).toBeGreaterThan(0)

            const decodedFile = await decodeFile(base64, 'test.txt')
            expect(decodedFile.name).toBe('test.txt')
            expect(await decodedFile.text()).toBe(content)
        })

        it('handles binary file data', async () => {
            const bytes = new Uint8Array([0x00, 0xff, 0x80, 0x7f, 0xde, 0xad, 0xbe, 0xef])
            const file = new File([bytes], 'binary.bin', { type: 'application/octet-stream' })

            const base64 = await encodeFile(file)
            const decodedFile = await decodeFile(base64, 'binary.bin')
            const decodedBytes = new Uint8Array(await decodedFile.arrayBuffer())
            expect(decodedBytes).toEqual(bytes)
        })

        it('handles empty file', async () => {
            const file = new File([], 'empty.txt', { type: 'text/plain' })
            const base64 = await encodeFile(file)
            expect(base64).toBe('')

            const decodedFile = await decodeFile(base64, 'empty.txt')
            expect(decodedFile.size).toBe(0)
        })
    })

    describe('validateBase64', () => {
        it('returns true for valid Base64', () => {
            expect(validateBase64('SGVsbG8gV29ybGQh')).toBe(true)
            expect(validateBase64('')).toBe(true)
            expect(validateBase64('YQ==')).toBe(true)
            expect(validateBase64('YWI=')).toBe(true)
            expect(validateBase64('YWJj')).toBe(true)
        })

        it('returns false for invalid Base64', () => {
            expect(validateBase64('Not Base64!')).toBe(false)
            expect(validateBase64('SGVsbG8gV29ybGQh!')).toBe(false)
            expect(validateBase64('YQ=invalid')).toBe(false)
        })
    })

    describe('round-trip consistency', () => {
        it('text round-trips through encode/decode', () => {
            const testCases = [
                '',
                'a',
                'abc',
                'Hello World',
                'Unicode: 日本語 🎌',
                'Special: \n\t\r\\"\'',
                'Long: '.repeat(100)
            ]

            for (const original of testCases) {
                const encoded = encodeText(original)
                const decoded = decodeText(encoded)
                expect(decoded).toBe(original)
            }
        })
    })
})