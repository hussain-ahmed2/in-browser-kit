import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageGifExtractorPage } from '@/features/image-gif-extractor/components/ImageGifExtractorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-gif-extractor')

export default function Page() {
  return (
    <ToolPage slug="image-gif-extractor">
      <StructuredData
        name="GIF Frame Extractor"
        description="Extract individual frames from animated GIFs as PNG images."
        url="https://inbrowserkit.netlify.app/tools/image-gif-extractor"
        category="ImageEditing"
      />
      <ImageGifExtractorPage />
    </ToolPage>
  )
}