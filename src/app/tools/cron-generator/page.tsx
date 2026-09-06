import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { CronGeneratorPage } from '@/features/cron-generator/components/CronGeneratorPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('cron-generator')

export default function Page() {
  return (
    <ToolPage slug="cron-generator">
      <StructuredData
        name="Cron Expression Generator"
        description="Build cron expressions visually or describe existing ones in human-readable form."
        url="https://inbrowserkit.netlify.app/tools/cron-generator"
        category="Utilities"
      />
      <CronGeneratorPage />
    </ToolPage>
  )
}
