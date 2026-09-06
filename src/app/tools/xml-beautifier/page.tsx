import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { XmlBeautifierPage } from '@/features/xml-beautifier/components/XmlBeautifierPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('xml-beautifier')

export default function Page() {
  return (
    <ToolPage slug="xml-beautifier">
      <StructuredData
        name="XML Formatter & Validator"
        description="Format, prettify, and validate XML documents locally."
        url="https://inbrowserkit.netlify.app/tools/xml-beautifier"
        category="Utilities"
      />
      <XmlBeautifierPage />
    </ToolPage>
  )
}
