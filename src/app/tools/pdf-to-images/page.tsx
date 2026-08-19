import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PdfToImagesPage } from '@/features/pdf-to-images/components/PdfToImagesPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('pdf-to-images')

export default function Page() {
    return (
        <ToolPage slug="pdf-to-images">
            <StructuredData
              name="PDF to Images"
              description="Convert PDF pages to high-quality images (PNG, JPEG, WebP) with customizable DPI and quality settings."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-to-images`}
              category="PDF"
            />
            <PdfToImagesPage />
        </ToolPage>
    )
}