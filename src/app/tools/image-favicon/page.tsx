import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageFaviconPage } from '@/features/image-favicon/components/ImageFaviconPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-favicon')

export default function Page() {
  return (
    <ToolPage slug="image-favicon">
      <StructuredData
        name="Favicon Generator"
        description="Create multi-size favicons and apple-touch-icons from any image."
        url="https://inbrowserkit.netlify.app/tools/image-favicon"
        category="ImageEditing"
      />
      <ImageFaviconPage />
    </ToolPage>
  )
}