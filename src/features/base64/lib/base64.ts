export type Base64Mode = 'encode' | 'decode'

export function encodeText(text: string): string {
    return btoa(unescape(encodeURIComponent(text)))
}

export function decodeText(base64: string): string {
    return decodeURIComponent(escape(atob(base64)))
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
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return new File([bytes], filename, { type: 'application/octet-stream' })
}

export function validateBase64(base64: string): boolean {
    try {
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) return false
        atob(base64)
        return true
    } catch {
        return false
    }
}