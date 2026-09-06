import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageColorPalettePage } from '@/features/color-palette/components/ImageColorPalettePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('color-palette')

export default function Page() {
  return (
    <ToolPage slug="color-palette">
      <StructuredData
        name="Color Palette Generator"
        description="Extract dominant colors from any image and get HEX, RGB, and HSL values."
        url={`${SITE_URL}/tools/color-palette`}
        category="ImageEditing"
      />
      <ImageColorPalettePage />
    </ToolPage>
  )
}
