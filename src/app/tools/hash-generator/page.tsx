import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { HashGeneratorPage } from '@/features/hash-generator/components/HashGeneratorPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('hash-generator')

export default function Page() {
    return (
        <ToolPage slug="hash-generator">
            <HashGeneratorPage />
        </ToolPage>
    )
}
