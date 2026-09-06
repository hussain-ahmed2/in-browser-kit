import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { HtmlToPdfPage } from '@/features/html-to-pdf/components/HtmlToPdfPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('html-to-pdf')

export default function Page() {
  return (
    <ToolPage slug="html-to-pdf">
      <StructuredData
        name="HTML to PDF"
        description="Convert HTML code to PDF using the browser print API."
        url={`${SITE_URL}/tools/html-to-pdf`}
        category="PDF"
      />
      <HtmlToPdfPage />
    </ToolPage>
  )
}
