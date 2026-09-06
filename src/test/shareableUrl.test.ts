import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  encodeToolConfig,
  decodeToolConfig,
  shareCurrentConfig,
  copyShareableUrl,
} from '@/lib/shareableUrl'

// ---------- browser globals for Node test env ----------

let currentHash = ''

const mockLocation = {
  get hash() { return currentHash },
  set hash(v: string) { currentHash = v },
  origin: 'http://localhost:3000',
  href: 'http://localhost:3000',
}

// Provide window via defineProperty (it may already exist as a getter)
Object.defineProperty(globalThis, 'window', {
  value: { location: mockLocation },
  writable: true,
  configurable: true,
})

// Provide navigator.clipboard
const writeTextSpy = vi.fn().mockResolvedValue(undefined)
if (!('navigator' in globalThis)) {
  Object.defineProperty(globalThis, 'navigator', {
    value: { clipboard: { writeText: writeTextSpy } },
    writable: true,
    configurable: true,
  })
} else {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText: writeTextSpy },
    writable: true,
    configurable: true,
  })
}

// ---------- helpers ----------

function setHash(hash: string) {
  currentHash = hash
}

// ---------- tests ----------

describe('shareableUrl', () => {
  beforeEach(() => {
    setHash('')
    writeTextSpy.mockClear()
  })

  // ---- encodeToolConfig ----

  describe('encodeToolConfig', () => {
    it('returns a URL with base64-encoded config in the hash', () => {
      const config = { offsetX: 4, color: '#000' }
      const url = encodeToolConfig('image-drop-shadow', config)

      expect(url).toContain('/tools/image-drop-shadow#config=')
      const base64 = url.split('#config=')[1]
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))))
      expect(decoded).toEqual(config)
    })

    it('works with empty config', () => {
      const url = encodeToolConfig('word-counter', {})
      const base64 = url.split('#config=')[1]
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))))
      expect(decoded).toEqual({})
    })

    it('handles nested objects', () => {
      const config = {
        fields: { minute: '*/5', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' },
        mode: 'builder',
      }
      const url = encodeToolConfig('cron-generator', config)
      const base64 = url.split('#config=')[1]
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))))
      expect(decoded).toEqual(config)
    })

    it('handles special characters in values', () => {
      const config = { text: 'Héllo Wörld! 你好 🎉 <script>alert("xss")</script>' }
      const url = encodeToolConfig('case-converter', config)
      const base64 = url.split('#config=')[1]
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))))
      expect(decoded.text).toBe(config.text)
    })

    it('handles boolean and number types', () => {
      const config = { colored: true, width: 120, opacity: 0.75 }
      const url = encodeToolConfig('image-ascii', config)
      const base64 = url.split('#config=')[1]
      const decoded = JSON.parse(decodeURIComponent(escape(atob(base64))))
      expect(decoded).toEqual(config)
    })

    it('preserves the tool slug in the URL path', () => {
      const url = encodeToolConfig('json-csv', { input: 'test' })
      expect(url).toMatch(/\/tools\/json-csv#config=/)
    })
  })

  // ---- decodeToolConfig ----

  describe('decodeToolConfig', () => {
    it('decodes a valid config from the URL hash', () => {
      const config = { offsetX: 4, offsetY: 8, blur: 12 }
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('image-drop-shadow')
      expect(decoded).toEqual(config)
    })

    it('returns null when hash is empty', () => {
      setHash('')
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('returns null when hash has no config parameter', () => {
      setHash('#somethingelse=abc')
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('returns null when config is invalid base64', () => {
      setHash('#config=!!!invalid-base64!!!')
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('returns null when base64 decodes to non-object JSON', () => {
      const base64 = btoa(unescape(encodeURIComponent('"just a string"')))
      setHash(`#config=${base64}`)
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('returns null when base64 decodes to an array', () => {
      const base64 = btoa(unescape(encodeURIComponent('[1, 2, 3]')))
      setHash(`#config=${base64}`)
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('gracefully handles malformed JSON after base64 decode', () => {
      const base64 = btoa('not valid json {')
      setHash(`#config=${base64}`)
      expect(decodeToolConfig('word-counter')).toBeNull()
    })

    it('decodes config with special characters', () => {
      const config = { text: 'Ñoño café résumé 日本語' }
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('case-converter')
      expect(decoded).toEqual(config)
    })
  })

  // ---- encode/decode round-trip ----

  describe('round-trip', () => {
    it('round-trips a simple config', () => {
      const config = { text: 'Hello World' }
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('word-counter')
      expect(decoded).toEqual(config)
    })

    it('round-trips a complex config', () => {
      const config = {
        fields: { minute: '*/5', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5' },
        directInput: '*/5 9 * * 1-5',
        mode: 'builder',
        expression: '*/5 9 * * 1-5',
        description: ['Every 5 minutes', 'At 09:00', 'Monday through Friday'],
      }
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('cron-generator')
      expect(decoded).toEqual(config)
    })

    it('round-trips empty config', () => {
      const config = {}
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('json-csv')
      expect(decoded).toEqual(config)
    })

    it('round-trips config with all value types', () => {
      const config = {
        stringVal: 'hello',
        numberVal: 42,
        floatVal: 3.14,
        boolTrue: true,
        boolFalse: false,
        nullVal: null,
        nestedObj: { key: 'value' },
      }
      const base64 = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      setHash(`#config=${base64}`)

      const decoded = decodeToolConfig('test-tool')
      expect(decoded).toEqual(config)
    })
  })

  // ---- shareCurrentConfig ----

  describe('shareCurrentConfig', () => {
    it('returns a URL identical to encodeToolConfig', () => {
      const config = { input: 'test data', mode: 'json-to-csv' }
      const result = shareCurrentConfig('json-csv', config)
      const expected = encodeToolConfig('json-csv', config)
      expect(result).toBe(expected)
    })
  })

  // ---- copyShareableUrl ----

  describe('copyShareableUrl', () => {
    it('copies URL to clipboard and returns it', async () => {
      const config = { text: 'some text' }
      const url = await copyShareableUrl('word-counter', config)

      expect(writeTextSpy).toHaveBeenCalledTimes(1)
      expect(writeTextSpy).toHaveBeenCalledWith(url)
      expect(url).toContain('/tools/word-counter#config=')
    })

    it('throws when clipboard write fails', async () => {
      writeTextSpy.mockRejectedValueOnce(new Error('denied'))

      await expect(
        copyShareableUrl('word-counter', { text: 'hi' })
      ).rejects.toThrow('denied')
    })
  })
})
