import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageGifMakerPage } from '@/features/image-gif-maker/components/ImageGifMakerPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-gif-maker')

export default function Page() {
  return (
    <ToolPage slug="image-gif-maker">
      <StructuredData
        name="GIF Maker"
        description="Create animated GIFs from a sequence of images with frame delay and loop control."
        url={`${SITE_URL}/tools/image-gif-maker`}
        category="ImageEditing"
      />
      <ImageGifMakerPage />
    </ToolPage>
  )
}