import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { SpeechToTextPage } from '@/features/speech-to-text/components/SpeechToTextPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('speech-to-text')

export default function Page() {
  return (
    <ToolPage slug="speech-to-text">
      <StructuredData
        name="Speech to Text"
        description="Transcribe spoken words to text in real-time using Web Speech API."
        url={`${SITE_URL}/tools/speech-to-text`}
        category="Utilities"
      />
      <SpeechToTextPage />
    </ToolPage>
  )
}
