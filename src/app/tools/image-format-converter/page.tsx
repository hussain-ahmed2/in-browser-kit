import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageFormatConverterPage } from '@/features/image-format-converter/components/ImageFormatConverterPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-format-converter')

export default function Page() {
  return (
    <ToolPage slug="image-format-converter">
      <StructuredData
        name="Image Format Converter"
        description="Convert images between JPG, PNG, WebP, AVIF, and BMP with quality control."
        url={`${SITE_URL}/tools/image-format-converter`}
        category="ImageEditing"
      />
      <ImageFormatConverterPage />
    </ToolPage>
  )
}