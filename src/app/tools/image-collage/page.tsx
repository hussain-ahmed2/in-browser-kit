import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageCollagePage } from '@/features/image-collage/components/ImageCollagePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-collage')

export default function Page() {
  return (
    <ToolPage slug="image-collage">
      <StructuredData
        name="Collage Maker"
        description="Combine multiple photos into a beautiful collage layout."
        url={`${SITE_URL}/tools/image-collage`}
        category="ImageEditing"
      />
      <ImageCollagePage />
    </ToolPage>
  )
}
