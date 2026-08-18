import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfSplitPage } from '@/features/pdf-split/components/PdfSplitPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-split')

export default function Page() {
    return (
        <ToolPage slug="pdf-split">
            <StructuredData
              name="PDF Split"
              description="Split a PDF by pages or ranges into separate files."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-split`}
              category="FileManagement"
            />
            <PdfSplitPage />
        </ToolPage>
    )
}