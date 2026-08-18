import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { HashGeneratorPage } from '@/features/hash-generator/components/HashGeneratorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('hash-generator')

export default function Page() {
    return (
        <ToolPage slug="hash-generator">
            <StructuredData
              name="Hash Generator"
              description="Generate cryptographic hashes for text and files."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/hash-generator`}
              category="Utilities"
            />
            <HashGeneratorPage />
        </ToolPage>
    )
}
