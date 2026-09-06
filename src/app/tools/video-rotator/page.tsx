import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoRotatorPage } from "@/features/video-rotator/components/VideoRotatorPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-rotator");

export default function Page() {
  return (
    <ToolPage slug="video-rotator">
      <StructuredData
        name="Video Rotator"
        description="Rotate or flip videos by 90°, 180°, 270°, or mirror horizontally/vertically."
        url={`${SITE_URL}/tools/video-rotator`}
        category="Utilities"
      />
      <VideoRotatorPage />
    </ToolPage>
  );
}
