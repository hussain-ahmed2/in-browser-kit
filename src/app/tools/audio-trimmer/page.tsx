import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { AudioTrimmerPage } from '@/features/audio-trimmer/components/AudioTrimmerPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('audio-trimmer')

export default function Page() {
  return (
    <ToolPage slug="audio-trimmer">
      <StructuredData
        name="Audio Trimmer"
        description="Trim audio files by setting start time and duration using FFmpeg."
        url={`${SITE_URL}/tools/audio-trimmer`}
        category="Video & Audio"
      />
      <AudioTrimmerPage />
    </ToolPage>
  )
}
