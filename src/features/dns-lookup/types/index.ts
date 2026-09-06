import * as z from 'zod'

export interface DnsRecord {
  type: string
  data: string
  ttl: number
}

export interface DnsResult {
  domain: string
  records: DnsRecord[]
  queryTime: number
}

export const dnsLookupSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  recordType: z.string().default('A'),
})

export type DnsLookupFormValues = z.input<typeof dnsLookupSchema>
