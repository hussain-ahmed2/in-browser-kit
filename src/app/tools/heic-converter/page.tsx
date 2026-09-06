import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageHeicConverterPage } from '@/features/heic-converter/components/ImageHeicConverterPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('heic-converter')

export default function Page() {
  return (
    <ToolPage slug="heic-converter">
      <StructuredData
        name="HEIC Converter"
        description="Convert HEIC/HEIF images (from iPhones) to JPG or PNG instantly in your browser."
        url={`${SITE_URL}/tools/heic-converter`}
        category="ImageEditing"
      />
      <ImageHeicConverterPage />
    </ToolPage>
  )
}
