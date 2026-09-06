import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoResizerPage } from "@/features/video-resizer/components/VideoResizerPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-resizer");

export default function Page() {
  return (
    <ToolPage slug="video-resizer">
      <StructuredData
        name="Video Resizer"
        description="Resize video dimensions to any width and height."
        url={`${SITE_URL}/tools/video-resizer`}
        category="Utilities"
      />
      <VideoResizerPage />
    </ToolPage>
  );
}
