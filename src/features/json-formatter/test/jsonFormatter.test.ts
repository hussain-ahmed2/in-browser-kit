import { describe, expect, it } from 'vitest'
import {
    formatJson,
    validateJson,
    jsonToTree,
    getJsonType,
    formatValue,
    getTypeColor
} from '../lib/jsonFormatter'

describe('JSON Formatter', () => {
    describe('formatJson', () => {
        it('formats simple object', () => {
            const input = '{"a":1,"b":2}'
            const result = formatJson(input, 'pretty')
            expect(result.error).toBeNull()
            expect(result.text).toBe('{\n  "a": 1,\n  "b": 2\n}')
        })

        it('formats nested object', () => {
            const input = '{"a":{"b":1}}'
            const result = formatJson(input, 'pretty')
            expect(result.error).toBeNull()
            expect(result.text).toContain('"b": 1')
        })

        it('formats array', () => {
            const input = '[1,2,3]'
            const result = formatJson(input, 'pretty')
            expect(result.error).toBeNull()
            expect(result.text).toBe('[\n  1,\n  2,\n  3\n]')
        })

        it('minifies JSON', () => {
            const input = '{\n  "a": 1\n}'
            const result = formatJson(input, 'minified')
            expect(result.error).toBeNull()
            expect(result.text).toBe('{"a":1}')
        })

        it('handles empty string', () => {
            const result = formatJson('', 'pretty')
            expect(result.error).toBe('Empty input')
        })

        it('handles whitespace only', () => {
            const result = formatJson('   \n\t  ', 'pretty')
            expect(result.error).toBe('Empty input')
        })

        it('returns error for invalid JSON', () => {
            const result = formatJson('{invalid}', 'pretty')
            expect(result.error).not.toBeNull()
            expect(result.text).toBe('')
        })

        it('handles unicode', () => {
            const input = '{"message":"こんにちは"}'
            const result = formatJson(input, 'pretty')
            expect(result.error).toBeNull()
            expect(result.text).toContain('こんにちは')
        })
    })

    describe('validateJson', () => {
        it('returns valid for valid JSON', () => {
            const result = validateJson('{"a":1}')
            expect(result.valid).toBe(true)
            expect(result.error).toBeNull()
        })

        it('returns invalid for invalid JSON', () => {
            const result = validateJson('{invalid}')
            expect(result.valid).toBe(false)
            expect(result.error).not.toBeNull()
        })

        it('returns invalid for empty string', () => {
            const result = validateJson('')
            expect(result.valid).toBe(false)
            expect(result.error).toBe('Empty input')
        })
    })

    describe('jsonToTree', () => {
        it('creates tree for primitive string', () => {
            const tree = jsonToTree('hello')
            expect(tree.type).toBe('string')
            expect(tree.value).toBe('hello')
            expect(tree.children).toBeUndefined()
        })

        it('creates tree for primitive number', () => {
            const tree = jsonToTree(42)
            expect(tree.type).toBe('number')
            expect(tree.value).toBe(42)
        })

        it('creates tree for boolean', () => {
            const tree = jsonToTree(true)
            expect(tree.type).toBe('boolean')
            expect(tree.value).toBe(true)
        })

        it('creates tree for null', () => {
            const tree = jsonToTree(null)
            expect(tree.type).toBe('null')
            expect(tree.value).toBeNull()
        })

        it('creates tree for object with children', () => {
            const tree = jsonToTree({ a: 1, b: 'test' })
            expect(tree.type).toBe('object')
            expect(tree.children).toHaveLength(2)
            expect(tree.children?.[0].key).toBe('a')
            expect(tree.children?.[0].value).toBe(1)
            expect(tree.children?.[1].key).toBe('b')
            expect(tree.children?.[1].value).toBe('test')
        })

        it('creates tree for array with children', () => {
            const tree = jsonToTree([1, 'two', true])
            expect(tree.type).toBe('array')
            expect(tree.children).toHaveLength(3)
            expect(tree.children?.[0].key).toBe('0')
            expect(tree.children?.[1].key).toBe('1')
            expect(tree.children?.[2].key).toBe('2')
        })

        it('creates tree for nested structure', () => {
            const tree = jsonToTree({ a: [1, { b: 2 }] })
            expect(tree.type).toBe('object')
            expect(tree.children).toHaveLength(1)
            expect(tree.children?.[0].key).toBe('a')
            expect(tree.children?.[0].type).toBe('array')
            expect(tree.children?.[0].children).toHaveLength(2)
        })
    })

    describe('getJsonType', () => {
        it('returns correct types', () => {
            expect(getJsonType('string')).toBe('string')
            expect(getJsonType(123)).toBe('number')
            expect(getJsonType(true)).toBe('boolean')
            expect(getJsonType(null)).toBe('null')
            expect(getJsonType({})).toBe('object')
            expect(getJsonType([])).toBe('array')
        })
    })

    describe('formatValue', () => {
        it('formats string with quotes', () => {
            expect(formatValue('hello', 'string')).toBe('"hello"')
        })

        it('formats null', () => {
            expect(formatValue(null, 'null')).toBe('null')
        })

        it('formats number', () => {
            expect(formatValue(42, 'number')).toBe('42')
        })

        it('formats boolean', () => {
            expect(formatValue(true, 'boolean')).toBe('true')
        })
    })

    describe('getTypeColor', () => {
        it('returns color classes for each type', () => {
            expect(getTypeColor('string')).toContain('green')
            expect(getTypeColor('number')).toContain('blue')
            expect(getTypeColor('boolean')).toContain('purple')
            expect(getTypeColor('null')).toContain('gray')
            expect(getTypeColor('object')).toContain('yellow')
            expect(getTypeColor('array')).toContain('orange')
        })
    })
})