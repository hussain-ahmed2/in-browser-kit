import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { RegexTesterPage } from '@/features/regex-tester/components/RegexTesterPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('regex-tester')

export default function Page() {
    return (
        <ToolPage slug="regex-tester">
            <StructuredData
              name="Regex Tester"
              description="Test regular expressions with live match highlighting, capture groups, and substitution preview."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/regex-tester`}
              category="Utilities"
            />
            <RegexTesterPage />
        </ToolPage>
    )
}