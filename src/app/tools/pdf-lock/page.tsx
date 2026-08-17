import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfLockPage } from '@/features/pdf-lock/components/PdfLockPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('pdf-lock')

export default function Page() {
    return (
        <ToolPage slug="pdf-lock">
            <PdfLockPage />
        </ToolPage>
    )
}