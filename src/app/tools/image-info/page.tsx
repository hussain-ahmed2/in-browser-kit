import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageInfoPage } from '@/features/image-info/components/ImageInfoPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-info')

export default function Page() {
  return (
    <ToolPage slug="image-info">
      <StructuredData
        name="Image Info Viewer"
        description="View DPI, color space, file size, dimensions, EXIF, ICC profile, and more."
        url="https://inbrowserkit.netlify.app/tools/image-info"
        category="ImageEditing"
      />
      <ImageInfoPage />
    </ToolPage>
  )
}