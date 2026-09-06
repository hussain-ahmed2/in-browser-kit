import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageCssSpritePage } from '@/features/image-css-sprite/components/ImageCssSpritePage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-css-sprite')

export default function Page() {
  return (
    <ToolPage slug="image-css-sprite">
      <StructuredData
        name="CSS Sprite Generator"
        description="Combine multiple images into a CSS sprite sheet with generated code."
        url="https://inbrowserkit.netlify.app/tools/image-css-sprite"
        category="ImageEditing"
      />
      <ImageCssSpritePage />
    </ToolPage>
  )
}
