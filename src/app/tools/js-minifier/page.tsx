import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { JsMinifierPage } from '@/features/js-minifier/components/JsMinifierPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('js-minifier')

export default function Page() {
  return (
    <ToolPage slug="js-minifier">
      <StructuredData
        name="JavaScript Minifier"
        description="Remove comments, collapse whitespace, and minify JavaScript."
        url={`${SITE_URL}/tools/js-minifier`}
        category="Utilities"
      />
      <JsMinifierPage />
    </ToolPage>
  )
}
