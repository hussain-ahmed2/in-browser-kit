import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageHtmlToImagePage } from '@/features/image-html-to-image/components/ImageHtmlToImagePage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-html-to-image')

export default function Page() {
  return (
    <ToolPage slug="image-html-to-image">
      <StructuredData
        name="HTML to Image"
        description="Convert HTML and CSS code into downloadable images."
        url="https://inbrowserkit.netlify.app/tools/image-html-to-image"
        category="ImageEditing"
      />
      <ImageHtmlToImagePage />
    </ToolPage>
  )
}
