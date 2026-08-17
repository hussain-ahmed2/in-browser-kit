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