import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfRemovePagesPage } from '@/features/pdf-remove-pages/components/PdfRemovePagesPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-remove-pages')

export default function Page() {
    return (
        <ToolPage slug="pdf-remove-pages">
            <StructuredData
              name="PDF Page Remover"
              description="Remove unwanted pages and download the cleaned file."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-remove-pages`}
              category="FileManagement"
            />
            <PdfRemovePagesPage />
        </ToolPage>
    )
}
