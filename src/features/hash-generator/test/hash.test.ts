import { describe, expect, it } from 'vitest'
import {
    HASH_ALGORITHMS,
    HASH_BIT_SIZES,
    hashText,
    hashTextBase64,
    type HashAlgorithm
} from '../lib/hash'

const KNOWN_VECTORS: Record<HashAlgorithm, { input: string; hex: string }> = {
    'SHA-1': {
        input: 'abc',
        hex: 'a9993e364706816aba3e25717850c26c9cd0d89d'
    },
    'SHA-256': {
        input: 'abc',
        hex: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    },
    'SHA-384': {
        input: 'abc',
        hex: 'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7'
    },
    'SHA-512': {
        input: 'abc',
        hex: 'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    }
}

describe('hashText', () => {
    it.each(HASH_ALGORITHMS)('matches the known vector for %s', async (algo) => {
        const { input, hex } = KNOWN_VECTORS[algo]
        await expect(hashText(algo, input)).resolves.toBe(hex)
    })

    it.each(HASH_ALGORITHMS)(
        'produces a hex string of %s bit size for %s',
        async (algo) => {
            const hex = await hashText(algo, 'hello world')
            expect(hex).toHaveLength(HASH_BIT_SIZES[algo] / 4)
            expect(hex).toMatch(/^[0-9a-f]+$/)
        }
    )

    it('is deterministic for the same input and algorithm', async () => {
        const [a, b] = await Promise.all([
            hashText('SHA-256', 'deterministic'),
            hashText('SHA-256', 'deterministic')
        ])
        expect(a).toBe(b)
    })

    it('differs across algorithms', async () => {
        const [sha1, sha256] = await Promise.all([
            hashText('SHA-1', 'same input'),
            hashText('SHA-256', 'same input')
        ])
        expect(sha1).not.toBe(sha256)
    })

    it('differs when the input changes', async () => {
        const [a, b] = await Promise.all([
            hashText('SHA-256', 'input one'),
            hashText('SHA-256', 'input two')
        ])
        expect(a).not.toBe(b)
    })
})

describe('hashTextBase64', () => {
    it('matches the base64 encoding of the hex digest', async () => {
        const base64 = await hashTextBase64('SHA-256', 'abc')
        const expected = Buffer.from(KNOWN_VECTORS['SHA-256'].hex, 'hex').toString(
            'base64'
        )
        expect(base64).toBe(expected)
    })

    it('round-trips back to the original digest bytes', async () => {
        const base64 = await hashTextBase64('SHA-256', 'abc')
        const hex = Buffer.from(base64, 'base64').toString('hex')
        expect(hex).toBe(KNOWN_VECTORS['SHA-256'].hex)
    })
})