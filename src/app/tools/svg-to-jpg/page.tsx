import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { SvgToJpgPage } from '@/features/svg-to-jpg/components/SvgToJpgPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('svg-to-jpg')

export default function Page() {
  return (
    <ToolPage slug="svg-to-jpg">
      <StructuredData
        name="SVG to JPG"
        description="Convert SVG files to JPG images with configurable background color."
        url={`${SITE_URL}/tools/svg-to-jpg`}
        category="Images"
      />
      <SvgToJpgPage />
    </ToolPage>
  )
}
