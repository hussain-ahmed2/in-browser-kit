import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImagePlaceholderPage } from '@/features/image-placeholder/components/ImagePlaceholderPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-placeholder')

export default function Page() {
  return (
    <ToolPage slug="image-placeholder">
      <StructuredData
        name="Placeholder Generator"
        description="Generate colored or textured placeholder images at any size."
        url="https://inbrowserkit.netlify.app/tools/image-placeholder"
        category="ImageEditing"
      />
      <ImagePlaceholderPage />
    </ToolPage>
  )
}
