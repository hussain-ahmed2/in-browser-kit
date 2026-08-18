import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { UnitConverterPage } from '@/features/unit-converter/components/UnitConverterPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('unit-converter')

export default function Page() {
    return (
        <ToolPage slug="unit-converter">
            <StructuredData
              name="Unit Converter"
              description="Convert between units of measurement including length, weight, temperature, data, time, area, volume, and speed."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/unit-converter`}
              category="Utilities"
            />
            <UnitConverterPage />
        </ToolPage>
    )
}