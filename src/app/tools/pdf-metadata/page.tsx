import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfMetadataPage } from "@/features/pdf-metadata/components/PdfMetadataPage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-metadata");

export default function Page() {
  return (
    <ToolPage slug="pdf-metadata">
      <StructuredData
        name="PDF Metadata Editor"
        description="View and modify hidden PDF metadata like Title, Author, and Subject."
        url={`${SITE_URL}/tools/pdf-metadata`}
        category="FileManagement"
      />
      <PdfMetadataPage />
    </ToolPage>
  );
}
