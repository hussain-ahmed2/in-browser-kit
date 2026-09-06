import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { GifToVideoPage } from "@/features/gif-to-video/components/GifToVideoPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("gif-to-video");

export default function Page() {
  return (
    <ToolPage slug="gif-to-video">
      <StructuredData
        name="GIF to Video"
        description="Convert animated GIFs to MP4 or WebM video files."
        url={`${SITE_URL}/tools/gif-to-video`}
        category="Utilities"
      />
      <GifToVideoPage />
    </ToolPage>
  );
}
