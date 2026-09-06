import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageLazyPlaceholderPage } from '@/features/image-lazy-placeholder/components/ImageLazyPlaceholderPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-lazy-placeholder')

export default function Page() {
  return (
    <ToolPage slug="image-lazy-placeholder">
      <StructuredData
        name="Lazy Load Placeholder"
        description="Generate tiny blurred placeholders for lazy loading images."
        url={`${SITE_URL}/tools/image-lazy-placeholder`}
        category="ImageEditing"
      />
      <ImageLazyPlaceholderPage />
    </ToolPage>
  )
}
