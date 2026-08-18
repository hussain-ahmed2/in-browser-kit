import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageResizePage } from '@/features/image-resize/components/ImageResizePage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('image-resize')

export default function Page() {
    return (
        <ToolPage slug="image-resize">
            <ImageResizePage />
        </ToolPage>
    )
}