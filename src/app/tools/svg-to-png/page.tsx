import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { SvgToPngPage } from '@/features/svg-to-png/components/SvgToPngPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('svg-to-png')

export default function Page() {
  return (
    <ToolPage slug="svg-to-png">
      <StructuredData
        name="SVG to PNG"
        description="Convert SVG files or code to high-quality PNG images."
        url={`${SITE_URL}/tools/svg-to-png`}
        category="Images"
      />
      <SvgToPngPage />
    </ToolPage>
  )
}
