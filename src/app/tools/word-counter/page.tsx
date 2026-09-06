import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { WordCounterPage } from '@/features/word-counter/components/WordCounterPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('word-counter')

export default function Page() {
  return (
    <ToolPage slug="word-counter">
      <StructuredData
        name="Word & Character Counter"
        description="Count words, characters, sentences, paragraphs, and estimate reading/speaking time."
        url={`${SITE_URL}/tools/word-counter`}
        category="Utilities"
      />
      <WordCounterPage />
    </ToolPage>
  )
}
