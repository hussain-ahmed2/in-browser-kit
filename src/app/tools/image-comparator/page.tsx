import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageComparatorPage } from '@/features/image-comparator/components/ImageComparatorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-comparator')

export default function Page() {
  return (
    <ToolPage slug="image-comparator">
      <StructuredData
        name="Image Diff"
        description="Compare two images side-by-side, overlay, or pixel diff."
        url="https://inbrowserkit.netlify.app/tools/image-comparator"
        category="ImageEditing"
      />
      <ImageComparatorPage />
    </ToolPage>
  )
}
