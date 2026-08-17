import { ImageCompressorPage } from "@/features/image-compressor/components/ImageCompressorPage";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function Page() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: "Image Compressor" }]} />
      </div>
      <ImageCompressorPage />
    </div>
  );
}
