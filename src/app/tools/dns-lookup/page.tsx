import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { DnsLookupPage } from '@/features/dns-lookup/components/DnsLookupPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('dns-lookup')

export default function Page() {
  return (
    <ToolPage slug="dns-lookup">
      <StructuredData
        name="DNS Record Lookup"
        description="Query DNS records for any domain using Cloudflare DNS-over-HTTPS."
        url="https://inbrowserkit.netlify.app/tools/dns-lookup"
        category="Utilities"
      />
      <DnsLookupPage />
    </ToolPage>
  )
}
