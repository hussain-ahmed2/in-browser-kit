import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { VideoToImagesPage } from "@/features/video-to-images/components/VideoToImagesPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("video-to-images");

export default function Page() {
  return (
    <ToolPage slug="video-to-images">
      <StructuredData
        name="Video to Images"
        description="Extract frames from a video as PNG or JPG images at any frame rate."
        url={`${SITE_URL}/tools/video-to-images`}
        category="Utilities"
      />
      <VideoToImagesPage />
    </ToolPage>
  );
}
