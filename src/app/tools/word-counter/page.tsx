import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { WordCounterPage } from '@/features/word-counter/components/WordCounterPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('word-counter')

export default function Page() {
  return (
    <ToolPage slug="word-counter">
      <StructuredData
        name="Word & Character Counter"
        description="Count words, characters, sentences, paragraphs, and estimate reading/speaking time."
        url="https://inbrowserkit.netlify.app/tools/word-counter"
        category="Utilities"
      />
      <WordCounterPage />
    </ToolPage>
  )
}
