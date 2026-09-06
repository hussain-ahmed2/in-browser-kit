import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { TextToSpeechPage } from '@/features/text-to-speech/components/TextToSpeechPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('text-to-speech')

export default function Page() {
  return (
    <ToolPage slug="text-to-speech">
      <StructuredData
        name="Text to Speech"
        description="Convert text to natural-sounding speech using Web Speech API."
        url={`${SITE_URL}/tools/text-to-speech`}
        category="Utilities"
      />
      <TextToSpeechPage />
    </ToolPage>
  )
}
