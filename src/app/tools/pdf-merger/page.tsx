import type { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfMergerPage } from "@/features/pdf-merger/components/PdfMergerPage";
import { toolMetadata } from "@/lib/site";

export const metadata: Metadata = toolMetadata("pdf-merger");

export default function Page() {
  return (
    <ToolPage slug="pdf-merger">
      <PdfMergerPage />
    </ToolPage>
  );
}