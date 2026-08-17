import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfSplitPage } from '@/features/pdf-split/components/PdfSplitPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('pdf-split')

export default function Page() {
    return (
        <ToolPage slug="pdf-split">
            <PdfSplitPage />
        </ToolPage>
    )
}