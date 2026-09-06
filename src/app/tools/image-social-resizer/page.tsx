import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageSocialResizerPage } from '@/features/image-social-resizer/components/ImageSocialResizerPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-social-resizer')

export default function Page() {
  return (
    <ToolPage slug="image-social-resizer">
      <StructuredData
        name="Social Media Resizer"
        description="Resize images to fit popular social media platform dimensions."
        url="https://inbrowserkit.netlify.app/tools/image-social-resizer"
        category="ImageEditing"
      />
      <ImageSocialResizerPage />
    </ToolPage>
  )
}
