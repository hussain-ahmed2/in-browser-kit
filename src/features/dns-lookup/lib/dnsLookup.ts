import type { DnsResult, DnsRecord } from '../types'

const CF_DNS_URL = 'https://cloudflare-dns.com/dns-query'

export const DNS_RECORD_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT', 'SOA'] as const

export async function lookupDns(
  domain: string,
  type: string = 'A'
): Promise<DnsResult> {
  const start = performance.now()

  const res = await fetch(`${CF_DNS_URL}?name=${encodeURIComponent(domain)}&type=${type}`, {
    headers: {
      Accept: 'application/dns-json',
    },
  })

  if (!res.ok) {
    throw new Error(`DNS query failed: ${res.statusText}`)
  }

  const data = await res.json()
  const elapsed = Math.round(performance.now() - start)

  if (data.Status !== 0) {
    const errorMessages: Record<number, string> = {
      1: 'Server error',
      2: 'Server failure',
      3: 'Non-existent domain',
      4: 'Not implemented',
      5: 'Query refused',
    }
    throw new Error(errorMessages[data.Status] || `DNS query error (status ${data.Status})`)
  }

  const records: DnsRecord[] = (data.Answer || []).map(
    (answer: { type: number; data: string; TTL: number }) => ({
      type: resolveRecordType(answer.type),
      data: answer.data,
      ttl: answer.TTL,
    })
  )

  return {
    domain,
    records,
    queryTime: elapsed,
  }
}

function resolveRecordType(typeCode: number): string {
  const types: Record<number, string> = {
    1: 'A',
    2: 'NS',
    5: 'CNAME',
    6: 'SOA',
    15: 'MX',
    16: 'TXT',
    28: 'AAAA',
  }
  return types[typeCode] || `TYPE${typeCode}`
}
