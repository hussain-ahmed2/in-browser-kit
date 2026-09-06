import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageMemePage } from '@/features/image-meme/components/ImageMemePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-meme')

export default function Page() {
  return (
    <ToolPage slug="image-meme">
      <StructuredData
        name="Meme Generator"
        description="Add top and bottom text to create memes from any image."
        url={`${SITE_URL}/tools/image-meme`}
        category="ImageEditing"
      />
      <ImageMemePage />
    </ToolPage>
  )
}
