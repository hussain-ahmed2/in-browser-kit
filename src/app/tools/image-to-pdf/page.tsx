import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageToPdfPage } from '@/features/image-to-pdf/components/ImageToPdfPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-to-pdf')

export default function Page() {
    return (
        <ToolPage slug="image-to-pdf">
            <StructuredData
              name="Image to PDF"
              description="Turn images into a single PDF with page size and fit control."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/image-to-pdf`}
              category="FileConversion"
            />
            <ImageToPdfPage />
        </ToolPage>
    )
}