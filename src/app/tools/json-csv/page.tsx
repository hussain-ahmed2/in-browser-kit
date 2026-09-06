import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { JsonCsvPage } from '@/features/json-csv/components/JsonCsvPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('json-csv')

export default function Page() {
  return (
    <ToolPage slug="json-csv">
      <StructuredData
        name="JSON ↔ CSV Converter"
        description="Convert between JSON and CSV formats with ease."
        url="https://inbrowserkit.netlify.app/tools/json-csv"
        category="Utilities"
      />
      <JsonCsvPage />
    </ToolPage>
  )
}
