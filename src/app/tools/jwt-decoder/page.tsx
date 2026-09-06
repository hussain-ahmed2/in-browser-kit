import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { JwtDecoderPage } from '@/features/jwt-decoder/components/JwtDecoderPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('jwt-decoder')

export default function Page() {
    return (
        <ToolPage slug="jwt-decoder">
            <StructuredData
                name="JWT Decoder"
                description="Decode JWT tokens and inspect header, payload, and signature claims."
                url={`${SITE_URL}/tools/jwt-decoder`}
                category="Utilities"
            />
            <JwtDecoderPage />
        </ToolPage>
    )
}