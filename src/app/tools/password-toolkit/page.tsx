import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { PasswordToolkitPage } from '@/features/password-toolkit/components/PasswordToolkitPage'
import { toolMetadata } from '@/lib/site'

export const metadata: Metadata = toolMetadata('password-toolkit')

export default function Page() {
    return (
        <ToolPage slug="password-toolkit">
            <PasswordToolkitPage />
        </ToolPage>
    )
}
