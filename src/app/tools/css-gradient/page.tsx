import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { CssGradientPage } from '@/features/css-gradient/components/CssGradientPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('css-gradient')

export default function Page() {
  return (
    <ToolPage slug="css-gradient">
      <StructuredData
        name="CSS Gradient Generator"
        description="Create beautiful CSS gradients with live preview."
        url={`${SITE_URL}/tools/css-gradient`}
        category="Utilities"
      />
      <CssGradientPage />
    </ToolPage>
  )
}
