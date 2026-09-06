import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoMutePage } from "@/features/video-mute/components/VideoMutePage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-mute");

export default function Page() {
  return (
    <ToolPage slug="video-mute">
      <StructuredData
        name="Video Mute"
        description="Remove the audio track from any video file."
        url={`${SITE_URL}/tools/video-mute`}
        category="Utilities"
      />
      <VideoMutePage />
    </ToolPage>
  );
}
