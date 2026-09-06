import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageGifOptimizerPage } from '@/features/image-gif-optimizer/components/ImageGifOptimizerPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-gif-optimizer')

export default function Page() {
  return (
    <ToolPage slug="image-gif-optimizer">
      <StructuredData
        name="GIF Optimizer"
        description="Reduce GIF file size by optimizing colors, removing duplicate frames, and applying lossy compression."
        url={`${SITE_URL}/tools/image-gif-optimizer`}
        category="ImageEditing"
      />
      <ImageGifOptimizerPage />
    </ToolPage>
  )
}