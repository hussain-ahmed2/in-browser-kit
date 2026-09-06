import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { lookupDns, DNS_RECORD_TYPES } from '../lib/dnsLookup'

const mockDnsResponse = {
  Status: 0,
  Answer: [
    { type: 1, data: '93.184.216.34', TTL: 3600 },
    { type: 1, data: '93.184.216.35', TTL: 3600 },
  ],
}

describe('DNS Lookup', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns DNS records for a valid domain', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify(mockDnsResponse))
    )

    const result = await lookupDns('example.com', 'A')

    expect(result.domain).toBe('example.com')
    expect(result.records).toHaveLength(2)
    expect(result.records[0].type).toBe('A')
    expect(result.records[0].data).toBe('93.184.216.34')
    expect(result.records[0].ttl).toBe(3600)
    expect(result.queryTime).toBeGreaterThanOrEqual(0)
  })

  it('handles empty answers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ Status: 0, Answer: [] }))
    )

    const result = await lookupDns('nonexistent.example.com', 'A')

    expect(result.records).toHaveLength(0)
  })

  it('throws on non-existent domain (Status 3)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ Status: 3 }))
    )

    await expect(lookupDns('doesnotexist.invalid', 'A')).rejects.toThrow(
      'Non-existent domain'
    )
  })

  it('throws on fetch failure', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('error', { status: 500 })
    )

    await expect(lookupDns('example.com')).rejects.toThrow(
      'DNS query failed'
    )
  })

  it('maps MX record types correctly', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          Status: 0,
          Answer: [{ type: 15, data: '10 mail.example.com', TTL: 300 }],
        })
      )
    )

    const result = await lookupDns('example.com', 'MX')

    expect(result.records[0].type).toBe('MX')
  })

  it('contains all expected record types', () => {
    expect(DNS_RECORD_TYPES).toContain('A')
    expect(DNS_RECORD_TYPES).toContain('AAAA')
    expect(DNS_RECORD_TYPES).toContain('CNAME')
    expect(DNS_RECORD_TYPES).toContain('MX')
    expect(DNS_RECORD_TYPES).toContain('NS')
    expect(DNS_RECORD_TYPES).toContain('TXT')
    expect(DNS_RECORD_TYPES).toContain('SOA')
  })
})
