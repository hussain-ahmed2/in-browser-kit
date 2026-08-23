import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfCropperPage } from '@/features/pdf-cropper/components/PdfCropperPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-cropper')

export default function Page() {
  return (
    <ToolPage slug="pdf-cropper">
      <StructuredData
        name="PDF Cropper"
        description="Visually crop page margins and trim off excess whitespace from your PDFs."
        url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-cropper`}
        category="FileManagement"
      />
      <PdfCropperPage />
    </ToolPage>
  )
}
