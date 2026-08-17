import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfRemovePagesPage } from '@/features/pdf-remove-pages/components/PdfRemovePagesPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('pdf-remove-pages')

export default function Page() {
    return (
        <ToolPage slug="pdf-remove-pages">
            <PdfRemovePagesPage />
        </ToolPage>
    )
}
