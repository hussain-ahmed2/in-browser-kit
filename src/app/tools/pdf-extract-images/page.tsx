import { PdfExtractImagesPage } from "@/features/pdf-extract-images/components/PdfExtractImagesPage";
import { ToolPage } from "@/features/tools/components/ToolPage";

export const metadata = {
  title: "Extract PDF Images | In-Browser Tools",
  description: "Extract all embedded images from a PDF into a ZIP file.",
};

export default function Page() {
  return (
    <ToolPage slug="pdf-extract-images">
      <PdfExtractImagesPage />
    </ToolPage>
  );
}
