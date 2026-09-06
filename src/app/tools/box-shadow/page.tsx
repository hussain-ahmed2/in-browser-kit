import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { BoxShadowPage } from '@/features/box-shadow/components/BoxShadowPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('box-shadow')

export default function Page() {
  return (
    <ToolPage slug="box-shadow">
      <StructuredData
        name="CSS Box Shadow Generator"
        description="Create custom box shadows with live preview and copy-ready CSS."
        url={`${SITE_URL}/tools/box-shadow`}
        category="Utilities"
      />
      <BoxShadowPage />
    </ToolPage>
  )
}
