import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageAnnotatePage } from '@/features/image-annotate/components/ImageAnnotatePage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-annotate')

export default function Page() {
  return (
    <ToolPage slug="image-annotate">
      <StructuredData
        name="Image Annotate"
        description="Draw arrows, shapes, and text on images with full control."
        url="https://inbrowserkit.netlify.app/tools/image-annotate"
        category="ImageEditing"
      />
      <ImageAnnotatePage />
    </ToolPage>
  )
}
