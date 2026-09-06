import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { HttpHeadersPage } from '@/features/http-headers/components/HttpHeadersPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('http-headers')

export default function Page() {
  return (
    <ToolPage slug="http-headers">
      <StructuredData
        name="HTTP Headers Checker"
        description="Inspect HTTP response headers, security headers, and connection timing for any URL."
        url="https://inbrowserkit.netlify.app/tools/http-headers"
        category="Utilities"
      />
      <HttpHeadersPage />
    </ToolPage>
  )
}
