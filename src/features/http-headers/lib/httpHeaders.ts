import type { HeadersResult, HeadersTiming } from '../types'

const SECURITY_HEADERS = [
  'strict-transport-security',
  'content-security-policy',
  'x-frame-options',
  'x-content-type-options',
  'x-xss-protection',
  'referrer-policy',
  'permissions-policy',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
]

export function isSecurityHeader(header: string): boolean {
  return SECURITY_HEADERS.includes(header.toLowerCase())
}

export async function checkHeaders(url: string): Promise<HeadersResult> {
  const normalizedUrl = normalizeUrl(url)
  const start = performance.now()

  let response: Response
  try {
    response = await fetch(normalizedUrl, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow',
    })
  } catch {
    // If CORS fails, try no-cors for timing at least
    try {
      await fetch(normalizedUrl, {
        method: 'HEAD',
        mode: 'no-cors',
      })
    } catch {
      // Fall through
    }
    const total = Math.round(performance.now() - start)
    throw new Error(
      `Unable to fetch headers for this URL (CORS restriction). Try a URL you control or one that allows cross-origin requests. Total time: ${total}ms`
    )
  }

  const total = Math.round(performance.now() - start)

  // Extract headers from response
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key] = value
  })

  // Get timing from Performance API
  const timing = getTiming(normalizedUrl, total)

  return {
    url: normalizedUrl,
    headers,
    statusCode: response.status,
    redirectChain: response.redirected ? [normalizedUrl] : [],
    timing,
  }
}

function getTiming(url: string, total: number): HeadersTiming {
  try {
    const entries = performance.getEntriesByName(url) as PerformanceNavigationTiming[]
    if (entries.length > 0) {
      const entry = entries[entries.length - 1] as PerformanceNavigationTiming
      return {
        dns: Math.round(entry.domainLookupEnd - entry.domainLookupStart) || 0,
        connect: Math.round(entry.connectEnd - entry.connectStart) || 0,
        tls: entry.secureConnectionStart > 0
          ? Math.round(entry.connectEnd - entry.secureConnectionStart)
          : 0,
        ttfb: Math.round(entry.responseStart - entry.requestStart) || 0,
        total: Math.round(entry.responseEnd - entry.startTime) || total,
      }
    }
  } catch {
    // Performance API not available or restricted
  }
  return { dns: 0, connect: 0, tls: 0, ttfb: 0, total }
}

function normalizeUrl(url: string): string {
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}
