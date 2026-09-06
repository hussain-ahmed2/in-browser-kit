import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfRotatePage } from '@/features/pdf-rotate/components/PdfRotatePage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-rotate')

export default function Page() {
    return (
        <ToolPage slug="pdf-rotate">
            <StructuredData
              name="PDF Rotate"
              description="Rotate all or selected pages of a PDF."
              url={`${SITE_URL}/tools/pdf-rotate`}
              category="FileManagement"
            />
            <PdfRotatePage />
        </ToolPage>
    )
}
