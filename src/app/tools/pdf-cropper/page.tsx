import { PdfCropperPage } from "@/features/pdf-cropper/components/PdfCropperPage";
import { ToolPage } from "@/features/tools/components/ToolPage";

export const metadata = {
  title: "PDF Cropper | In-Browser Tools",
  description: "Crop page margins visually and trim off excess whitespace from your PDFs.",
};

export default function Page() {
  return (
    <ToolPage slug="pdf-cropper">
      <PdfCropperPage />
    </ToolPage>
  );
}
