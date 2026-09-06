import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { AudioConverterPage } from '@/features/audio-converter/components/AudioConverterPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('audio-converter')

export default function Page() {
  return (
    <ToolPage slug="audio-converter">
      <StructuredData
        name="Audio Format Converter"
        description="Convert between MP3, WAV, OGG, AAC, and FLAC audio formats."
        url={`${SITE_URL}/tools/audio-converter`}
        category="Video & Audio"
      />
      <AudioConverterPage />
    </ToolPage>
  )
}
