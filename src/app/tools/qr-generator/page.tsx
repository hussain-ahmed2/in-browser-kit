import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { QrGeneratorPage } from '@/features/qr-generator/components/QrGeneratorPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('qr-generator')

export default function Page() {
  return (
    <ToolPage slug="qr-generator">
      <QrGeneratorPage />
    </ToolPage>
  )
}