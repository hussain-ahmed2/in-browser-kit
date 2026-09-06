import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ExcelToPdfPage } from '@/features/excel-to-pdf/components/ExcelToPdfPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('excel-to-pdf')

export default function Page() {
  return (
    <ToolPage slug="excel-to-pdf">
      <StructuredData
        name="Excel to PDF"
        description="Convert CSV/Excel files to formatted PDF tables."
        url={`${SITE_URL}/tools/excel-to-pdf`}
        category="PDF"
      />
      <ExcelToPdfPage />
    </ToolPage>
  )
}
