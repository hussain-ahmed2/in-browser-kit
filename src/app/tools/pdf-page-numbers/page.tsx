import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfPageNumbersPage } from "@/features/pdf-page-numbers/components/PdfPageNumbersPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-page-numbers");

export default function Page() {
  return (
    <ToolPage slug="pdf-page-numbers">
      <StructuredData
        name="Add Page Numbers"
        description="Automatically stamp sequential page numbers across a PDF document."
        url={`${SITE_URL}/tools/pdf-page-numbers`}
        category="FileManagement"
      />
      <PdfPageNumbersPage />
    </ToolPage>
  );
}
