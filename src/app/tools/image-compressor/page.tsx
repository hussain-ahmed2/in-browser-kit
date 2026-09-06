import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { ImageCompressorPage } from "@/features/image-compressor/components/ImageCompressorPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("image-compressor");

export default function Page() {
  return (
    <ToolPage slug="image-compressor">
      <StructuredData
              name="Image Compressor"
              description="Compress images with quality and dimension controls."
              url={`${SITE_URL}/tools/image-compressor`}
              category="ImageEditing"
            />
      <ImageCompressorPage />
    </ToolPage>
  );
}