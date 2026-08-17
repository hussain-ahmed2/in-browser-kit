import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfRotatePage } from '@/features/pdf-rotate/components/PdfRotatePage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('pdf-rotate')

export default function Page() {
    return (
        <ToolPage slug="pdf-rotate">
            <PdfRotatePage />
        </ToolPage>
    )
}
