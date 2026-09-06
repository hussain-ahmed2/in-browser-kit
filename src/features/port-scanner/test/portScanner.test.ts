import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { checkPort } from '../lib/portScanner'
import { COMMON_PORTS } from '../types'

describe('Port Scanner', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    vi.stubGlobal('DOMException', class DOMException extends Error {
      name = ''
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reports open port on successful fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    const result = await checkPort('example.com', 443)

    expect(result.host).toBe('example.com')
    expect(result.port).toBe(443)
    expect(result.status).toBe('open')
    expect(result.responseTime).toBeGreaterThanOrEqual(0)
  })

  it('reports closed port on network error', async () => {
    const error = new TypeError('Failed to fetch')
    vi.mocked(fetch).mockRejectedValueOnce(error)

    const result = await checkPort('example.com', 9999)

    expect(result.host).toBe('example.com')
    expect(result.port).toBe(9999)
    expect(result.status).toBe('closed')
  })

  it('normalizes host by stripping protocol', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    const result = await checkPort('https://example.com', 443)

    expect(result.host).toBe('example.com')
  })

  it('uses HTTPS protocol for port 443', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    await checkPort('example.com', 443)

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('https://')
  })

  it('uses HTTP protocol for port 80', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    await checkPort('example.com', 80)

    const calledUrl = vi.mocked(fetch).mock.calls[0][0] as string
    expect(calledUrl).toContain('http://')
  })

  it('has all expected common ports', () => {
    expect(COMMON_PORTS).toHaveLength(10)
    const ports = COMMON_PORTS.map((p) => p.port)
    expect(ports).toContain(80)
    expect(ports).toContain(443)
    expect(ports).toContain(22)
    expect(ports).toContain(21)
    expect(ports).toContain(25)
    expect(ports).toContain(53)
    expect(ports).toContain(3306)
    expect(ports).toContain(5432)
    expect(ports).toContain(6379)
    expect(ports).toContain(27017)
  })

  it('strips path from host', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('', { status: 200 }))

    const result = await checkPort('example.com/some/path', 80)

    expect(result.host).toBe('example.com')
  })
})
