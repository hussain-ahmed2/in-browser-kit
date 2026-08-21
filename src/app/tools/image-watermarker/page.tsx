import { ToolPage } from "@/features/tools/components/ToolPage";
import { ImageWatermarkerPage } from "@/features/image-watermarker/components/ImageWatermarkerPage";

export default function ImageWatermarkerRoute() {
  return (
    <ToolPage slug="image-watermarker" maxWidth="container">
      <ImageWatermarkerPage />
    </ToolPage>
  );
}
