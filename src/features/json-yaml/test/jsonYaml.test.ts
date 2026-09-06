import { describe, expect, it } from 'vitest'
import { jsonToYaml, yamlToJson } from '../lib/jsonYaml'

describe('JSON ↔ YAML Converter', () => {
  describe('jsonToYaml', () => {
    it('converts simple JSON to YAML', () => {
      const json = '{"name": "Alice", "age": 30}'
      const yaml = jsonToYaml(json)
      expect(yaml).toContain('name: Alice')
      expect(yaml).toContain('age: 30')
    })

    it('handles nested objects', () => {
      const json = '{"person": {"name": "Bob"}}'
      const yaml = jsonToYaml(json)
      expect(yaml).toContain('person:')
      expect(yaml).toContain('name: Bob')
    })

    it('handles arrays', () => {
      const json = '{"items": [1, 2, 3]}'
      const yaml = jsonToYaml(json)
      expect(yaml).toContain('items:')
      expect(yaml).toContain('- 1')
    })

    it('handles null values', () => {
      const json = '{"val": null}'
      const yaml = jsonToYaml(json)
      expect(yaml).toContain('val: null')
    })

    it('handles boolean values', () => {
      const json = '{"flag": true}'
      const yaml = jsonToYaml(json)
      expect(yaml).toContain('flag: true')
    })
  })

  describe('yamlToJson', () => {
    it('converts simple YAML to JSON', () => {
      const yaml = 'name: Alice\nage: 30'
      const jsonStr = yamlToJson(yaml)
      const parsed = JSON.parse(jsonStr)
      expect(parsed.name).toBe('Alice')
      expect(parsed.age).toBe(30)
    })
  })
})
