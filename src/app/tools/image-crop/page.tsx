import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageCropPage } from '@/features/image-crop/components/ImageCropPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-crop')

export default function Page() {
  return (
    <ToolPage slug="image-crop">
      <StructuredData
        name="Image Crop"
        description="Visually crop images with free or locked aspect ratios."
        url={`${SITE_URL}/tools/image-crop`}
        category="ImageEditing"
      />
      <ImageCropPage />
    </ToolPage>
  )
}
