import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageDropShadowPage } from '@/features/image-drop-shadow/components/ImageDropShadowPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-drop-shadow')

export default function Page() {
  return (
    <ToolPage slug="image-drop-shadow">
      <StructuredData
        name="Drop Shadow"
        description="Add configurable drop shadows to images with full control."
        url="https://inbrowserkit.netlify.app/tools/image-drop-shadow"
        category="ImageEditing"
      />
      <ImageDropShadowPage />
    </ToolPage>
  )
}
