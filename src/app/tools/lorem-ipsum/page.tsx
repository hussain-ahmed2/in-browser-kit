import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { LoremIpsumPage } from '@/features/lorem-ipsum/components/LoremIpsumPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('lorem-ipsum')

export default function Page() {
  return (
    <ToolPage slug="lorem-ipsum">
      <StructuredData
        name="Lorem Ipsum Generator"
        description="Generate realistic placeholder text for your designs and mockups."
        url={`${SITE_URL}/tools/lorem-ipsum`}
        category="Utilities"
      />
      <LoremIpsumPage />
    </ToolPage>
  )
}
