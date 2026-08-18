import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfMergerPage } from "@/features/pdf-merger/components/PdfMergerPage";
import { toolMetadata } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("pdf-merger");

export default function Page() {
  return (
    <ToolPage slug="pdf-merger">
      <StructuredData
              name="PDF Merger"
              description="Combine multiple PDFs into one with drag-and-drop reordering."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/pdf-merger`}
              category="FileManagement"
            />
      <PdfMergerPage />
    </ToolPage>
  );
}