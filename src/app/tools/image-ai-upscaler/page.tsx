import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageAiUpscalerPage } from '@/features/image-ai-upscaler/components/ImageAiUpscalerPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-ai-upscaler')

export default function Page() {
  return (
    <ToolPage slug="image-ai-upscaler">
      <StructuredData
        name="AI Image Upscaler"
        description="Upscale images 2x using neural network inference in the browser."
        url={`${SITE_URL}/tools/image-ai-upscaler`}
        category="ImageEditing"
      />
      <ImageAiUpscalerPage />
    </ToolPage>
  )
}
