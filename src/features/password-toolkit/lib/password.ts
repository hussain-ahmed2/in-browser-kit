export interface PasswordOptions {
    length: number
    useLowercase: boolean
    useUppercase: boolean
    useDigits: boolean
    useSymbols: boolean
    excludeAmbiguous: boolean
}

export const DEFAULT_PASSWORD_OPTIONS: PasswordOptions = {
    length: 16,
    useLowercase: true,
    useUppercase: true,
    useDigits: true,
    useSymbols: true,
    excludeAmbiguous: false
}

const CHARSETS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?/~'
} as const

const AMBIGUOUS_CHARS = /[il1LoO0|]/

function randomInt(maxExclusive: number): number {
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
    const buffer = new Uint32Array(1)
    let value: number
    do {
        crypto.getRandomValues(buffer)
        value = buffer[0]
    } while (value >= limit)
    return value % maxExclusive
}

/**
 * Generates a cryptographically random password, guaranteeing at least one
 * character from each enabled character set before filling the remainder.
 */
export function generatePassword(options: PasswordOptions): string {
    const sets = (
        [
            [options.useLowercase, CHARSETS.lowercase],
            [options.useUppercase, CHARSETS.uppercase],
            [options.useDigits, CHARSETS.digits],
            [options.useSymbols, CHARSETS.symbols]
        ] as const
    )
        .filter(([enabled]) => enabled)
        .map(([, chars]) =>
            options.excludeAmbiguous
                ? chars.replace(AMBIGUOUS_CHARS, '')
                : chars
        )
        .filter((chars) => chars.length > 0)

    if (sets.length === 0) return ''

    const length = Math.min(Math.max(1, Math.round(options.length)), 1024)
    const chars: string[] = []

    for (const set of sets) {
        if (chars.length >= length) break
        chars.push(set[randomInt(set.length)])
    }

    const combined = sets.join('')
    while (chars.length < length) {
        chars.push(combined[randomInt(combined.length)])
    }

    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1)
        const current = chars[i]
        chars[i] = chars[j]
        chars[j] = current
    }

    return chars.join('')
}

/**
 * Estimates entropy in bits, assuming a uniform distribution over the widest
 * character pool that the password's used character classes imply. This is an
 * upper bound — it does not account for dictionary words or patterns.
 */
export function estimateEntropy(password: string): number {
    if (!password) return 0

    let classes = 0
    if (/[a-z]/.test(password)) classes += 1
    if (/[A-Z]/.test(password)) classes += 1
    if (/[0-9]/.test(password)) classes += 1
    if (/[^a-zA-Z0-9]/.test(password)) classes += 1

    const poolSizes = [0, 10, 36, 62, 94]
    return password.length * Math.log2(poolSizes[classes])
}

export interface StrengthResult {
    score: 0 | 1 | 2 | 3 | 4
    label: string
    entropy: number
    suggestions: string[]
}

export const STRENGTH_LABELS = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong'
] as const

export function scorePassword(password: string): StrengthResult {
    const entropy = estimateEntropy(password)

    if (!password) {
        return { score: 0, label: STRENGTH_LABELS[0], entropy, suggestions: [] }
    }

    const suggestions: string[] = []
    if (password.length < 12) {
        suggestions.push('Use at least 12 characters — length matters most.')
    } else if (password.length < 16) {
        suggestions.push(
            '16+ characters are recommended for high-value accounts.'
        )
    }
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters.')
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters.')
    if (!/[0-9]/.test(password)) suggestions.push('Add numbers.')
    if (!/[^a-zA-Z0-9]/.test(password)) suggestions.push('Add symbols.')
    if (/(.)\1{2,}/.test(password)) {
        suggestions.push('Avoid repeating the same character 3+ times.')
    }
    if (/^[a-zA-Z]+$/.test(password) || /^\d+$/.test(password)) {
        suggestions.push('A single character class is easy to guess — mix it up.')
    }

    let score: 0 | 1 | 2 | 3 | 4
    if (entropy < 28) score = 0
    else if (entropy < 40) score = 1
    else if (entropy < 56) score = 2
    else if (entropy < 80) score = 3
    else score = 4

    return { score, label: STRENGTH_LABELS[score], entropy, suggestions }
}
