import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageAsciiPage } from '@/features/image-ascii/components/ImageAsciiPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-ascii')

export default function Page() {
  return (
    <ToolPage slug="image-ascii">
      <StructuredData
        name="Image to ASCII Art"
        description="Convert any image into text-based ASCII art."
        url={`${SITE_URL}/tools/image-ascii`}
        category="ImageEditing"
      />
      <ImageAsciiPage />
    </ToolPage>
  )
}
