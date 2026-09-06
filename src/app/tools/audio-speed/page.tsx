import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { AudioSpeedPage } from '@/features/audio-speed/components/AudioSpeedPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('audio-speed')

export default function Page() {
  return (
    <ToolPage slug="audio-speed">
      <StructuredData
        name="Audio Speed Changer"
        description="Speed up or slow down audio files using FFmpeg."
        url={`${SITE_URL}/tools/audio-speed`}
        category="Video & Audio"
      />
      <AudioSpeedPage />
    </ToolPage>
  )
}
