import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { WordToPdfPage } from '@/features/word-to-pdf/components/WordToPdfPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('word-to-pdf')

export default function Page() {
  return (
    <ToolPage slug="word-to-pdf">
      <StructuredData
        name="Word to PDF"
        description="Convert DOCX documents to PDF locally in your browser."
        url={`${SITE_URL}/tools/word-to-pdf`}
        category="PDF"
      />
      <WordToPdfPage />
    </ToolPage>
  )
}
