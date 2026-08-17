import { ToolPage } from "@/features/tools/components/ToolPage";
import { ImageCompressorPage } from "@/features/image-compressor/components/ImageCompressorPage";

export default function Page() {
  return (
    <ToolPage slug="image-compressor">
      <ImageCompressorPage />
    </ToolPage>
  );
}