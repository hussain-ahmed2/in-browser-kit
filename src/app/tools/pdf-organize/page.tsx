import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfOrganizePage } from "@/features/pdf-organize/components/PdfOrganizePage";
import { toolMetadata, SITE_URL } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-organize");

export default function Page() {
  return (
    <ToolPage slug="pdf-organize" maxWidth="4xl">
      <StructuredData
        name="Organize PDF Pages"
        description="Visually reorder pages in a PDF using a drag-and-drop interface. Delete unwanted pages easily."
        url={`${SITE_URL}/tools/pdf-organize`}
        category="FileManagement"
      />
      <PdfOrganizePage />
    </ToolPage>
  );
}
