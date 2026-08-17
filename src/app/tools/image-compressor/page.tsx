import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { ImageCompressorPage } from "@/features/image-compressor/components/ImageCompressorPage";
import { toolMetadata } from "@/lib/site";

export const metadata: Metadata = toolMetadata("image-compressor");

export default function Page() {
  return (
    <ToolPage slug="image-compressor">
      <ImageCompressorPage />
    </ToolPage>
  );
}