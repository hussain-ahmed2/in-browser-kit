import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfWatermarkPage } from "@/features/pdf-watermark/components/PdfWatermarkPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-watermark");

export default function Page() {
  return (
    <ToolPage slug="pdf-watermark">
      <StructuredData
        name="PDF Watermark"
        description="Stamp text or image watermarks onto PDF pages locally in your browser."
        url={`${SITE_URL}/tools/pdf-watermark`}
        category="FileManagement"
      />
      <PdfWatermarkPage />
    </ToolPage>
  );
}
