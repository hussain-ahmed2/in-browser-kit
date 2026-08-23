import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfFlattenPage } from '@/features/pdf-flatten/components/PdfFlattenPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-flatten')

export default function Page() {
  return (
    <ToolPage slug="pdf-flatten">
      <StructuredData
        name="PDF Flatten"
        description="Permanently burn form fields and interactive elements into the PDF visual layer."
        url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-flatten`}
        category="FileManagement"
      />
      <PdfFlattenPage />
    </ToolPage>
  )
}
