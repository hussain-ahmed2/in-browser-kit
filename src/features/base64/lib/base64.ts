export type Base64Mode = 'encode' | 'decode'

export function encodeText(text: string): string {
    return btoa(unescape(encodeURIComponent(text)))
}

export function decodeText(base64: string): string {
    const cleaned = base64.replace(/\s+/g, '')
    return decodeURIComponent(escape(atob(cleaned)))
}

export function encodeFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const arrayBuffer = reader.result as ArrayBuffer
            const bytes = new Uint8Array(arrayBuffer)
            let binary = ''
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            resolve(btoa(binary))
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
    })
}

export async function decodeFile(base64: string, filename: string): Promise<File> {
    const cleaned = base64.replace(/\s+/g, '')
    const binary = atob(cleaned)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return new File([bytes], filename, { type: 'application/octet-stream' })
}

export function validateBase64(base64: string): boolean {
    try {
        // Remove whitespace (newlines, spaces, tabs) that may be present in pasted Base64
        const cleaned = base64.replace(/\s+/g, '')
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) return false
        atob(cleaned)
        return true
    } catch {
        return false
    }
}