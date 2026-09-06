import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageBorderPage } from '@/features/image-border/components/ImageBorderPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-border')

export default function Page() {
  return (
    <ToolPage slug="image-border">
      <StructuredData
        name="Image Border"
        description="Add decorative borders, frames, and rounded corners to images."
        url={`${SITE_URL}/tools/image-border`}
        category="ImageEditing"
      />
      <ImageBorderPage />
    </ToolPage>
  )
}
