import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { HtmlMinifierPage } from '@/features/html-minifier/components/HtmlMinifierPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('html-minifier')

export default function Page() {
  return (
    <ToolPage slug="html-minifier">
      <StructuredData
        name="HTML Minifier"
        description="Remove comments, collapse whitespace, and minify HTML for production."
        url={`${SITE_URL}/tools/html-minifier`}
        category="Utilities"
      />
      <HtmlMinifierPage />
    </ToolPage>
  )
}
