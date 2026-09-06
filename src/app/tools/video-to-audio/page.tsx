import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoToAudioPage } from "@/features/video-to-audio/components/VideoToAudioPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-to-audio");

export default function Page() {
  return (
    <ToolPage slug="video-to-audio">
      <StructuredData
        name="Video to Audio"
        description="Extract audio from video files as MP3, WAV, AAC, or OGG."
        url={`${SITE_URL}/tools/video-to-audio`}
        category="Utilities"
      />
      <VideoToAudioPage />
    </ToolPage>
  );
}
