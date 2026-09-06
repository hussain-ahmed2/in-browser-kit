import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ScreenCapturePage } from '@/features/screen-capture/components/ScreenCapturePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('screen-capture')

export default function Page() {
  return (
    <ToolPage slug="screen-capture">
      <StructuredData
        name="Screen Capture Tool"
        description="Capture screenshots of your screen directly in the browser."
        url={`${SITE_URL}/tools/screen-capture`}
        category="Utilities"
      />
      <ScreenCapturePage />
    </ToolPage>
  )
}
