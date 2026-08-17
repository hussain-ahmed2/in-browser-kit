export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: readonly HashAlgorithm[] = [
    'SHA-1',
    'SHA-256',
    'SHA-384',
    'SHA-512'
]

export const HASH_BIT_SIZES: Record<HashAlgorithm, number> = {
    'SHA-1': 160,
    'SHA-256': 256,
    'SHA-384': 384,
    'SHA-512': 512
}

async function digest(algo: HashAlgorithm, text: string): Promise<Uint8Array> {
    const data = new TextEncoder().encode(text)
    const buffer = await crypto.subtle.digest(algo, data)
    return new Uint8Array(buffer)
}

export async function hashText(
    algo: HashAlgorithm,
    text: string
): Promise<string> {
    const bytes = await digest(algo, text)
    return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('')
}

export async function hashTextBase64(
    algo: HashAlgorithm,
    text: string
): Promise<string> {
    const bytes = await digest(algo, text)
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
}
