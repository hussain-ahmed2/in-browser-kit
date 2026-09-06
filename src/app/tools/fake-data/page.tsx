import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { FakeDataPage } from '@/features/fake-data/components/FakeDataPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('fake-data')

export default function Page() {
  return (
    <ToolPage slug="fake-data">
      <StructuredData
        name="Fake Data Generator"
        description="Generate realistic fake data for testing — names, emails, addresses, and more."
        url={`${SITE_URL}/tools/fake-data`}
        category="Utilities"
      />
      <FakeDataPage />
    </ToolPage>
  )
}
