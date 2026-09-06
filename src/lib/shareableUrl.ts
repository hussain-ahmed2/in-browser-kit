/**
 * Utility functions for shareable tool configuration URLs.
 *
 * Config is encoded as base64 in the URL hash fragment:
 *   /tools/{slug}#config={base64}
 *
 * Hash fragments are never sent to the server, so no file data or
 * sensitive information leaks via network requests.
 */

/**
 * Encode a tool configuration into a shareable URL.
 * The config is JSON-serialised then base64-encoded and placed in the URL hash.
 */
export function encodeToolConfig(
  toolSlug: string,
  config: Record<string, unknown>
): string {
  const json = JSON.stringify(config)
  const base64 = btoa(unescape(encodeURIComponent(json)))
  const baseUrl = window.location.origin
  return `${baseUrl}/tools/${toolSlug}#config=${base64}`
}

/**
 * Read and decode a tool configuration from the current URL hash.
 * Returns `null` when the hash is missing, malformed, or cannot be parsed.
 */
export function decodeToolConfig(
  _toolSlug: string
): Record<string, unknown> | null {
  try {
    const hash = window.location.hash
    if (!hash) return null

    const match = hash.match(/#config=(.+)/)
    if (!match) return null

    const base64 = match[1]
    const json = decodeURIComponent(escape(atob(base64)))
    const parsed = JSON.parse(json)

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }

    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Build a shareable URL for the current page's tool and the given config.
 */
export function shareCurrentConfig(
  toolSlug: string,
  config: Record<string, unknown>
): string {
  return encodeToolConfig(toolSlug, config)
}

/**
 * Copy a shareable URL (tool + config) to the clipboard.
 * Returns the URL that was copied.
 */
export async function copyShareableUrl(
  toolSlug: string,
  config: Record<string, unknown>
): Promise<string> {
  const url = encodeToolConfig(toolSlug, config)
  await navigator.clipboard.writeText(url)
  return url
}
