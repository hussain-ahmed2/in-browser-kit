import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfLockPage } from '@/features/pdf-lock/components/PdfLockPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-lock')

export default function Page() {
    return (
        <ToolPage slug="pdf-lock">
            <StructuredData
              name="PDF Lock / Unlock"
              description="Encrypt PDFs with passwords or remove existing passwords."
              url={`${SITE_URL}/tools/pdf-lock`}
              category="FileSecurity"
            />
            <PdfLockPage />
        </ToolPage>
    )
}