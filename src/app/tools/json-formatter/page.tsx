import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { JsonFormatterPage } from '@/features/json-formatter/components/JsonFormatterPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('json-formatter')

export default function Page() {
    return (
        <ToolPage slug="json-formatter">
            <StructuredData
              name="JSON Formatter"
              description="Format, validate, and visualize JSON with tree view."
              url={`${SITE_URL}/tools/json-formatter`}
              category="Utilities"
            />
            <JsonFormatterPage />
        </ToolPage>
    )
}