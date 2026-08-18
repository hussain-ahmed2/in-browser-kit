import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageResizePage } from '@/features/image-resize/components/ImageResizePage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-resize')

export default function Page() {
    return (
        <ToolPage slug="image-resize">
            <StructuredData
              name="Resize & Convert"
              description="Resize images by max dimension and convert between formats."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/image-resize`}
              category="ImageEditing"
            />
            <ImageResizePage />
        </ToolPage>
    )
}