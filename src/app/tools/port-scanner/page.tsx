import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PortScannerPage } from '@/features/port-scanner/components/PortScannerPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('port-scanner')

export default function Page() {
  return (
    <ToolPage slug="port-scanner">
      <StructuredData
        name="Port Scanner"
        description="Check if common or custom ports are open on a host."
        url="https://inbrowserkit.netlify.app/tools/port-scanner"
        category="Utilities"
      />
      <PortScannerPage />
    </ToolPage>
  )
}
