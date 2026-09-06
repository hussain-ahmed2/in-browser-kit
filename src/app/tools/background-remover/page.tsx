import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { BackgroundRemoverPage } from '@/features/background-remover/components/BackgroundRemoverPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('background-remover')

export default function Page() {
  return (
    <ToolPage slug="background-remover">
      <StructuredData
        name="AI Background Remover"
        description="Remove image backgrounds instantly using AI running in the browser."
        url={`${SITE_URL}/tools/background-remover`}
        category="ImageEditing"
      />
      <BackgroundRemoverPage />
    </ToolPage>
  )
}
