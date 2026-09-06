import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageRotatePage } from '@/features/image-rotate/components/ImageRotatePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-rotate')

export default function Page() {
  return (
    <ToolPage slug="image-rotate">
      <StructuredData
        name="Rotate & Flip"
        description="Rotate images by any angle and flip horizontally or vertically."
        url={`${SITE_URL}/tools/image-rotate`}
        category="ImageEditing"
      />
      <ImageRotatePage />
    </ToolPage>
  )
}
