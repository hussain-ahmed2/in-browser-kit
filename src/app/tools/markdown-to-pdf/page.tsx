import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { MarkdownToPdfPage } from '@/features/markdown-to-pdf/components/MarkdownToPdfPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('markdown-to-pdf')

export default function Page() {
  return (
    <ToolPage slug="markdown-to-pdf">
      <StructuredData
        name="Markdown to PDF"
        description="Write Markdown and convert it to a downloadable PDF."
        url={`${SITE_URL}/tools/markdown-to-pdf`}
        category="PDF"
      />
      <MarkdownToPdfPage />
    </ToolPage>
  )
}
