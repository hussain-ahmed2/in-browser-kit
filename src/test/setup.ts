// Vitest global setup - wrap URL.createObjectURL to track blobs for tests

// Node 24 has native URL.createObjectURL. We wrap it to track blobs in a registry.
const blobRegistry = new Map<string, Blob>()
let blobCounter = 0

const originalCreateObjectURL = URL.createObjectURL
const originalRevokeObjectURL = URL.revokeObjectURL

URL.createObjectURL = (blob: Blob) => {
    const url = `blob:mock-${blobCounter++}`
    blobRegistry.set(url, blob)
    // Also call native to support any internal uses
    try { originalCreateObjectURL(blob) } catch {}
    return url
}
URL.revokeObjectURL = (url: string) => {
    blobRegistry.delete(url)
    try { originalRevokeObjectURL(url) } catch {}
}

// Helper for tests to read back blobs
export function readPdfBlob(url: string) {
    const blob = blobRegistry.get(url)
    if (!blob) throw new Error(`Unknown blob URL: ${url}`)
    return blob
}

export function clearBlobRegistry() {
    blobRegistry.clear()
}

// ProgressEvent polyfill for Node test environment
if (typeof globalThis.ProgressEvent === 'undefined') {
    class ProgressEventPolyfill extends Event {
        lengthComputable: boolean
        loaded: number
        total: number

        constructor(type: string, eventInitDict?: ProgressEventInit) {
            super(type, eventInitDict)
            this.lengthComputable = eventInitDict?.lengthComputable ?? false
            this.loaded = eventInitDict?.loaded ?? 0
            this.total = eventInitDict?.total ?? 0
        }
    }
    globalThis.ProgressEvent = ProgressEventPolyfill
}

// DOMException polyfill for Node test environment
if (typeof globalThis.DOMException === 'undefined') {
    class DOMExceptionPolyfill extends Error {
        name: string
        code: number
        constructor(message?: string, name?: string) {
            super(message)
            this.name = name || 'Error'
            this.code = 0
        }
    }
    // @ts-expect-error - adding polyfill
    globalThis.DOMException = DOMExceptionPolyfill
}

// FileReader polyfill for Node test environment - always override in tests
class FileReaderPolyfill {
    result: string | ArrayBuffer | null = null
    error: DOMException | null = null
    readyState: 0 | 1 | 2 = 0
    onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null
    onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null
    onloadstart: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null
    onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null
    onprogress: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null
    onabort: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null

    // FileReader constants
    static EMPTY = 0
    static LOADING = 1
    static DONE = 2
    readonly EMPTY = 0
    readonly LOADING = 1
    readonly DONE = 2

    readAsArrayBuffer(blob: Blob) {
        this.readyState = 1
        this.onloadstart?.(new ProgressEvent('loadstart') as ProgressEvent<FileReader>)
        // Immediately resolve synchronously for tests
        const buffer = blob.arrayBuffer()
        if (buffer instanceof Promise) {
            buffer.then((buf) => {
                this.result = buf
                this.readyState = 2
                this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            }).catch((err) => {
                this.error = new DOMException(err.message, 'AbortError')
                this.readyState = 2
                this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            })
        } else {
            this.result = buffer
            this.readyState = 2
            this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
            this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
        }
    }

    readAsText(blob: Blob) {
        this.readyState = 1
        this.onloadstart?.(new ProgressEvent('loadstart') as ProgressEvent<FileReader>)
        const text = blob.text()
        if (text instanceof Promise) {
            text.then((t) => {
                this.result = t
                this.readyState = 2
                this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            }).catch((err) => {
                this.error = new DOMException(err.message, 'AbortError')
                this.readyState = 2
                this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            })
        } else {
            this.result = text
            this.readyState = 2
            this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
            this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
        }
    }

    readAsDataURL(blob: Blob) {
        this.readyState = 1
        this.onloadstart?.(new ProgressEvent('loadstart') as ProgressEvent<FileReader>)
        const buffer = blob.arrayBuffer()
        if (buffer instanceof Promise) {
            buffer.then((buf) => {
                const base64 = Buffer.from(buf).toString('base64')
                const mime = blob.type || 'application/octet-stream'
                this.result = `data:${mime};base64,${base64}`
                this.readyState = 2
                this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            }).catch((err) => {
                this.error = new DOMException(err.message, 'AbortError')
                this.readyState = 2
                this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            })
        } else {
            const base64 = Buffer.from(buffer).toString('base64')
            const mime = blob.type || 'application/octet-stream'
            this.result = `data:${mime};base64,${base64}`
            this.readyState = 2
            this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
            this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
        }
    }

    readAsBinaryString(blob: Blob) {
        this.readyState = 1
        this.onloadstart?.(new ProgressEvent('loadstart') as ProgressEvent<FileReader>)
        const text = blob.text()
        if (text instanceof Promise) {
            text.then((t) => {
                this.result = t
                this.readyState = 2
                this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            }).catch((err) => {
                this.error = new DOMException(err.message, 'AbortError')
                this.readyState = 2
                this.onerror?.(new ProgressEvent('error') as ProgressEvent<FileReader>)
                this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
            })
        } else {
            this.result = text
            this.readyState = 2
            this.onload?.(new ProgressEvent('load') as ProgressEvent<FileReader>)
            this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
        }
    }

    abort() {
        this.readyState = 2
        this.onabort?.(new ProgressEvent('abort') as ProgressEvent<FileReader>)
        this.onloadend?.(new ProgressEvent('loadend') as ProgressEvent<FileReader>)
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true }
}

// Force the polyfill in test environment
globalThis.FileReader = FileReaderPolyfill as typeof globalThis.FileReader