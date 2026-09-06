import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageOcrPage } from '@/features/image-ocr/components/ImageOcrPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-ocr')

export default function Page() {
  return (
    <ToolPage slug="image-ocr">
      <StructuredData
        name="OCR Text Recognition"
        description="Extract text from images in 10+ languages using Tesseract.js."
        url={`${SITE_URL}/tools/image-ocr`}
        category="ImageEditing"
      />
      <ImageOcrPage />
    </ToolPage>
  )
}
