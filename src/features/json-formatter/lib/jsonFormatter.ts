export type JsonFormatMode = 'pretty' | 'minified'

export interface JsonFormatResult {
    text: string
    error: string | null
}

export function formatJson(text: string, mode: JsonFormatMode = 'pretty'): JsonFormatResult {
    if (!text.trim()) {
        return { text: '', error: 'Empty input' }
    }

    try {
        const parsed = JSON.parse(text)
        const formatted = mode === 'pretty'
            ? JSON.stringify(parsed, null, 2)
            : JSON.stringify(parsed)
        return { text: formatted, error: null }
    } catch (e) {
        return { text: '', error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
}

export function validateJson(text: string): { valid: boolean; error: string | null } {
    if (!text.trim()) {
        return { valid: false, error: 'Empty input' }
    }
    try {
        JSON.parse(text)
        return { valid: true, error: null }
    } catch (e) {
        return { valid: false, error: e instanceof Error ? e.message : 'Invalid JSON' }
    }
}

export interface JsonTreeNode {
    key: string | null
    value: unknown
    type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
    children?: JsonTreeNode[]
    expanded?: boolean
}

export function jsonToTree(value: unknown, key: string | null = null): JsonTreeNode {
    const type = getJsonType(value)

    if (type === 'object' && value !== null) {
        const obj = value as Record<string, unknown>
        return {
            key,
            value,
            type,
            children: Object.keys(obj).map((k) => jsonToTree(obj[k], k)),
            expanded: true
        }
    }

    if (type === 'array') {
        const arr = value as unknown[]
        return {
            key,
            value,
            type,
            children: arr.map((v, i) => jsonToTree(v, String(i))),
            expanded: true
        }
    }

    return {
        key,
        value,
        type,
        expanded: false
    }
}

export function getJsonType(value: unknown): JsonTreeNode['type'] {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value as JsonTreeNode['type']
}

export function getTypeColor(type: JsonTreeNode['type']): string {
    switch (type) {
        case 'string': return 'text-green-600 dark:text-green-400'
        case 'number': return 'text-blue-600 dark:text-blue-400'
        case 'boolean': return 'text-purple-600 dark:text-purple-400'
        case 'null': return 'text-gray-500 dark:text-gray-400'
        case 'object': return 'text-yellow-600 dark:text-yellow-400'
        case 'array': return 'text-orange-600 dark:text-orange-400'
    }
}

export function formatValue(value: unknown, type: JsonTreeNode['type']): string {
    if (type === 'string') return `"${value}"`
    if (type === 'null') return 'null'
    return String(value)
}