import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageExifStripperPage } from '@/features/image-exif-stripper/components/ImageExifStripperPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-exif-stripper')

export default function Page() {
  return (
    <ToolPage slug="image-exif-stripper">
      <StructuredData
        name="EXIF Stripper"
        description="Remove EXIF metadata from images to protect your privacy."
        url={`${SITE_URL}/tools/image-exif-stripper`}
        category="ImageEditing"
      />
      <ImageExifStripperPage />
    </ToolPage>
  )
}
