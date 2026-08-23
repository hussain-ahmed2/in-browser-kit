import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageBase64Page } from '@/features/image-base64/components/ImageBase64Page'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-base64')

export default function Page() {
  return (
    <ToolPage slug="image-base64">
      <StructuredData
        name="Image ↔ Base64"
        description="Encode images to Base64 data URIs and decode them back."
        url="https://inbrowserkit.netlify.app/tools/image-base64"
        category="ImageEditing"
      />
      <ImageBase64Page />
    </ToolPage>
  )
}
