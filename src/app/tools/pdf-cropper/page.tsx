import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfCropperPage } from '@/features/pdf-cropper/components/PdfCropperPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-cropper')

export default function Page() {
  return (
    <ToolPage slug="pdf-cropper">
      <StructuredData
        name="PDF Cropper"
        description="Visually crop page margins and trim off excess whitespace from your PDFs."
        url={`${SITE_URL}/tools/pdf-cropper`}
        category="FileManagement"
      />
      <PdfCropperPage />
    </ToolPage>
  )
}
