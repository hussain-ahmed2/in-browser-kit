import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { UuidGeneratorPage } from '@/features/uuid-generator/components/UuidGeneratorPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('uuid-generator')

export default function Page() {
    return (
        <ToolPage slug="uuid-generator">
            <StructuredData
              name="UUID Generator"
              description="Generate UUIDs (v1, v4, v7) with customizable formatting."
              url={`${SITE_URL}/tools/uuid-generator`}
              category="Utilities"
            />
            <UuidGeneratorPage />
        </ToolPage>
    )
}