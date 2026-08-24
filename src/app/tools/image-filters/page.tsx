import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageFiltersPage } from '@/features/image-filters/components/ImageFiltersPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-filters')

export default function Page() {
  return (
    <ToolPage slug="image-filters">
      <StructuredData
        name="Image Filters & Effects"
        description="Adjust brightness, contrast, blur, sepia, grayscale, and more with live preview."
        url="https://inbrowserkit.netlify.app/tools/image-filters"
        category="ImageEditing"
      />
      <ImageFiltersPage />
    </ToolPage>
  )
}