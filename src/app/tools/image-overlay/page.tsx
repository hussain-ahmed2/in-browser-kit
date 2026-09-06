import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageOverlayPage } from '@/features/image-overlay/components/ImageOverlayPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-overlay')

export default function Page() {
  return (
    <ToolPage slug="image-overlay">
      <StructuredData
        name="Image Overlay"
        description="Layer one image on another with opacity and blend modes."
        url={`${SITE_URL}/tools/image-overlay`}
        category="ImageEditing"
      />
      <ImageOverlayPage />
    </ToolPage>
  )
}
