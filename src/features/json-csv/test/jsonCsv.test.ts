import { describe, expect, it } from 'vitest'
import { jsonToCsv, csvToJson } from '../lib/jsonCsv'

describe('JSON CSV Converter', () => {
  describe('jsonToCsv', () => {
    it('converts array of objects to CSV', () => {
      const json = JSON.stringify([{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }])
      const result = jsonToCsv(json)
      expect(result).toContain('name')
      expect(result).toContain('age')
      expect(result).toContain('John')
      expect(result).toContain('30')
    })

    it('converts single object to CSV', () => {
      const json = JSON.stringify({ name: 'John', age: 30 })
      const result = jsonToCsv(json)
      expect(result).toContain('name')
      expect(result).toContain('John')
    })

    it('throws on empty input', () => {
      expect(() => jsonToCsv('')).toThrow()
    })

    it('throws on invalid JSON', () => {
      expect(() => jsonToCsv('not json')).toThrow()
    })
  })

  describe('csvToJson', () => {
    it('converts CSV to JSON', () => {
      const csv = 'name,age\nJohn,30\nJane,25'
      const result = csvToJson(csv)
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('name', 'John')
      expect(result[0]).toHaveProperty('age', '30')
    })

    it('throws on empty input', () => {
      expect(() => csvToJson('')).toThrow()
    })

    it('handles CSV with no header', () => {
      const csv = 'John,30\nJane,25'
      const result = csvToJson(csv, { header: false })
      expect(result).toHaveLength(2)
    })
  })
})
