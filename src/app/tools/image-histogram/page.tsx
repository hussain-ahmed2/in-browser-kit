import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageHistogramPage } from '@/features/image-histogram/components/ImageHistogramPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-histogram')

export default function Page() {
  return (
    <ToolPage slug="image-histogram">
      <StructuredData
        name="Image Histogram"
        description="View RGB and luminance channel distributions of an image."
        url={`${SITE_URL}/tools/image-histogram`}
        category="ImageEditing"
      />
      <ImageHistogramPage />
    </ToolPage>
  )
}
