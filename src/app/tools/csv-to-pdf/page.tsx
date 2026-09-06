import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { CsvToPdfPage } from '@/features/csv-to-pdf/components/CsvToPdfPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('csv-to-pdf')

export default function Page() {
  return (
    <ToolPage slug="csv-to-pdf">
      <StructuredData
        name="CSV to PDF"
        description="Convert CSV data into a formatted PDF table."
        url={`${SITE_URL}/tools/csv-to-pdf`}
        category="PDF"
      />
      <CsvToPdfPage />
    </ToolPage>
  )
}
