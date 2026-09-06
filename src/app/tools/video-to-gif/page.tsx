import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoToGifPage } from "@/features/video-to-gif/components/VideoToGifPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-to-gif");

export default function Page() {
  return (
    <ToolPage slug="video-to-gif">
      <StructuredData
        name="Video to GIF"
        description="Convert video clips to animated GIFs with custom FPS, dimensions, and timing."
        url={`${SITE_URL}/tools/video-to-gif`}
        category="Utilities"
      />
      <VideoToGifPage />
    </ToolPage>
  );
}
