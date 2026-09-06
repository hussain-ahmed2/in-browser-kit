import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { CssMinifierPage } from '@/features/css-minifier/components/CssMinifierPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('css-minifier')

export default function Page() {
  return (
    <ToolPage slug="css-minifier">
      <StructuredData
        name="CSS Minifier & Beautifier"
        description="Minify CSS for production or beautify it for readability."
        url={`${SITE_URL}/tools/css-minifier`}
        category="Utilities"
      />
      <CssMinifierPage />
    </ToolPage>
  )
}
