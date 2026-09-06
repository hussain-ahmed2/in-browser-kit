import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PasswordToolkitPage } from '@/features/password-toolkit/components/PasswordToolkitPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('password-toolkit')

export default function Page() {
    return (
        <ToolPage slug="password-toolkit">
            <StructuredData
              name="Password Toolkit"
              description="Generate strong passwords and check their strength."
              url={`${SITE_URL}/tools/password-toolkit`}
              category="Security"
            />
            <PasswordToolkitPage />
        </ToolPage>
    )
}
