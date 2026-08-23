import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfCompressorPage } from '@/features/pdf-compressor/components/PdfCompressorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-compressor')

export default function Page() {
  return (
    <ToolPage slug="pdf-compressor">
      <StructuredData
        name="PDF Compressor"
        description="Reduce PDF file sizes locally with structural optimization."
        url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-compressor`}
        category="FileManagement"
      />
      <PdfCompressorPage />
    </ToolPage>
  )
}
