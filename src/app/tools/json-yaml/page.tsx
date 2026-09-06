import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { JsonYamlPage } from '@/features/json-yaml/components/JsonYamlPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('json-yaml')

export default function Page() {
  return (
    <ToolPage slug="json-yaml">
      <StructuredData
        name="JSON ↔ YAML Converter"
        description="Convert between JSON and YAML formats with ease."
        url={`${SITE_URL}/tools/json-yaml`}
        category="Utilities"
      />
      <JsonYamlPage />
    </ToolPage>
  )
}
