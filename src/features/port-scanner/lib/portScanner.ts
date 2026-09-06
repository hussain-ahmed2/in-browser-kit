import type { PortResult } from '../types'

const DEFAULT_TIMEOUT = 3000

function getProtocolForPort(port: number): string {
  if (port === 443 || port === 8443) return 'https'
  return 'http'
}

export async function checkPort(
  host: string,
  port: number,
  timeout: number = DEFAULT_TIMEOUT
): Promise<PortResult> {
  const normalizedHost = host.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const protocol = getProtocolForPort(port)
  const url = `${protocol}://${normalizedHost}:${port}`

  const start = performance.now()

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    })

    clearTimeout(timer)
    const responseTime = Math.round(performance.now() - start)

    return {
      host: normalizedHost,
      port,
      status: 'open',
      responseTime,
    }
  } catch (err) {
    const responseTime = Math.round(performance.now() - start)

    if (err instanceof DOMException && err.name === 'AbortError') {
      return {
        host: normalizedHost,
        port,
        status: 'filtered',
        responseTime,
      }
    }

    // Network error before timeout likely means port is closed (not filtered)
    if (responseTime < timeout * 0.5) {
      return {
        host: normalizedHost,
        port,
        status: 'closed',
        responseTime,
      }
    }

    return {
      host: normalizedHost,
      port,
      status: 'filtered',
      responseTime,
    }
  }
}

export async function scanPorts(
  host: string,
  ports: number[],
  timeout: number = DEFAULT_TIMEOUT,
  onProgress?: (result: PortResult) => void
): Promise<PortResult[]> {
  const results: PortResult[] = []

  // Scan ports concurrently in batches of 5
  const batchSize = 5
  for (let i = 0; i < ports.length; i += batchSize) {
    const batch = ports.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map((port) =>
        checkPort(host, port, timeout).then((result) => {
          onProgress?.(result)
          return result
        })
      )
    )
    results.push(...batchResults)
  }

  return results
}
