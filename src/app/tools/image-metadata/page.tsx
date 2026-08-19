import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageMetadataPage } from '@/features/image-metadata/components/ImageMetadataPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-metadata')

export default function Page() {
    return (
        <ToolPage slug="image-metadata">
            <StructuredData
                name="Image Metadata"
                description="Inspect EXIF, IPTC, ICC, and GPS metadata embedded in your images."
                url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/image-metadata`}
                category="Images"
            />
            <ImageMetadataPage />
        </ToolPage>
    )
}