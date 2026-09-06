import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { MarkdownPreviewPage } from '@/features/markdown-preview/components/MarkdownPreviewPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('markdown-preview')

export default function Page() {
  return (
    <ToolPage slug="markdown-preview">
      <StructuredData
        name="Markdown Preview"
        description="Write Markdown and see a live-rendered HTML preview."
        url={`${SITE_URL}/tools/markdown-preview`}
        category="Utilities"
      />
      <MarkdownPreviewPage />
    </ToolPage>
  )
}
