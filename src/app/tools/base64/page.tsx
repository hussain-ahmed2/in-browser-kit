import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { Base64Page } from '@/features/base64/components/Base64Page'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('base64')

export default function Page() {
    return (
        <ToolPage slug="base64">
            <StructuredData
              name="Base64 Encode/Decode"
              description="Convert between text/files and Base64 encoding."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/base64`}
              category="Utilities"
            />
            <Base64Page />
        </ToolPage>
    )
}