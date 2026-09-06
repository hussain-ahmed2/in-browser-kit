import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { IpLookupPage } from '@/features/ip-lookup/components/IpLookupPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('ip-lookup')

export default function Page() {
  return (
    <ToolPage slug="ip-lookup">
      <StructuredData
        name="IP Address Lookup"
        description="Look up IP address details including location, ISP, timezone, and coordinates."
        url="https://inbrowserkit.netlify.app/tools/ip-lookup"
        category="Utilities"
      />
      <IpLookupPage />
    </ToolPage>
  )
}
