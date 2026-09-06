import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageColorPickerPage } from '@/features/image-color-picker/components/ImageColorPickerPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-color-picker')

export default function Page() {
  return (
    <ToolPage slug="image-color-picker">
      <StructuredData
        name="Color Picker"
        description="Pick any color from an image and get HEX, RGB, and HSL values."
        url={`${SITE_URL}/tools/image-color-picker`}
        category="ImageEditing"
      />
      <ImageColorPickerPage />
    </ToolPage>
  )
}
