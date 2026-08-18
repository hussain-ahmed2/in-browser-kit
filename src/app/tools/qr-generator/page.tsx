import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { QrGeneratorPage } from '@/features/qr-generator/components/QrGeneratorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('qr-generator')

export default function Page() {
  return (
    <ToolPage slug="qr-generator">
            <StructuredData
              name="QR Code Generator"
              description="Create QR codes for URLs, Wi-Fi, contact info, and more."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/qr-generator`}
              category="Utilities"
            />
      <QrGeneratorPage />
    </ToolPage>
  )
}