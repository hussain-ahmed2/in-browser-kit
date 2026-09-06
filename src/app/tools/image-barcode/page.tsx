import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageBarcodePage } from '@/features/image-barcode/components/ImageBarcodePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-barcode')

export default function Page() {
  return (
    <ToolPage slug="image-barcode">
      <StructuredData
        name="Barcode Generator"
        description="Generate barcodes in various formats from text input."
        url={`${SITE_URL}/tools/image-barcode`}
        category="ImageEditing"
      />
      <ImageBarcodePage />
    </ToolPage>
  )
}
