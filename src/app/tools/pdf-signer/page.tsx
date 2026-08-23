import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfSignerPage } from "@/features/pdf-signer/components/PdfSignerPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-signer");

export default function Page() {
  return (
    <ToolPage slug="pdf-signer">
      <StructuredData
        name="PDF Signer"
        description="Draw, type, or upload a signature and stamp it onto a PDF document securely in your browser."
        url={`${SITE_URL}/tools/pdf-signer`}
        category="FileManagement"
      />
      <PdfSignerPage />
    </ToolPage>
  );
}
