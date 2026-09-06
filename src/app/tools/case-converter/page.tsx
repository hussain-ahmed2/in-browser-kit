import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { CaseConverterPage } from '@/features/case-converter/components/CaseConverterPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('case-converter')

export default function Page() {
  return (
    <ToolPage slug="case-converter">
      <StructuredData
        name="Text Case Converter"
        description="Convert text between different case formats instantly."
        url="https://inbrowserkit.netlify.app/tools/case-converter"
        category="Utilities"
      />
      <CaseConverterPage />
    </ToolPage>
  )
}
