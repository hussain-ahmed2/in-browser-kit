import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfToMarkdownPage } from '@/features/pdf-to-markdown/components/PdfToMarkdownPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-to-markdown')

export default function Page() {
  return (
    <ToolPage slug="pdf-to-markdown">
      <StructuredData
        name="PDF to Markdown"
        description="Extract text from a PDF and format it as Markdown."
        url={`${SITE_URL}/tools/pdf-to-markdown`}
        category="PDF"
      />
      <PdfToMarkdownPage />
    </ToolPage>
  )
}
