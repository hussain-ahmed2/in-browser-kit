import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { AudioRecorderPage } from '@/features/audio-recorder/components/AudioRecorderPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('audio-recorder')

export default function Page() {
  return (
    <ToolPage slug="audio-recorder">
      <StructuredData
        name="Audio Recorder"
        description="Record audio from your microphone with live waveform visualization."
        url={`${SITE_URL}/tools/audio-recorder`}
        category="Utilities"
      />
      <AudioRecorderPage />
    </ToolPage>
  )
}
