import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageToPdfPage } from '@/features/image-to-pdf/components/ImageToPdfPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('image-to-pdf')

export default function Page() {
    return (
        <ToolPage slug="image-to-pdf">
            <ImageToPdfPage />
        </ToolPage>
    )
}