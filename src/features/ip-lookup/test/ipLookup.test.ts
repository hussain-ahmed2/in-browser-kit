import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { lookupIp } from '../lib/ipLookup'

const mockIpData = { ip: '8.8.8.8' }
const mockGeoData = {
  ip: '8.8.8.8',
  city: 'Mountain View',
  region: 'California',
  country_name: 'United States',
  org: 'AS15169 Google LLC',
  timezone: 'America/Los_Angeles',
  latitude: 37.386,
  longitude: -122.0838,
  postal: '94035',
}

describe('IP Lookup', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('looks up own IP when no manual IP provided', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(JSON.stringify(mockIpData)))
      .mockResolvedValueOnce(new Response(JSON.stringify(mockGeoData)))

    const result = await lookupIp()

    expect(result.ip).toBe('8.8.8.8')
    expect(result.city).toBe('Mountain View')
    expect(result.country).toBe('United States')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('skips ipify fetch when manual IP is provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockGeoData))
    )

    const result = await lookupIp('8.8.8.8')

    expect(result.ip).toBe('8.8.8.8')
    expect(result.org).toBe('AS15169 Google LLC')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('throws on failed ipify fetch', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('error', { status: 500 }))

    await expect(lookupIp()).rejects.toThrow('Failed to fetch your IP address')
  })

  it('throws on failed geo lookup', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockIpData)))
    vi.mocked(fetch).mockResolvedValueOnce(new Response('error', { status: 500 }))

    await expect(lookupIp()).rejects.toThrow('Failed to look up IP details')
  })

  it('throws on API error response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ error: true, reason: 'Reserved range' }))
    )

    await expect(lookupIp('192.168.1.1')).rejects.toThrow('Reserved range')
  })
})
