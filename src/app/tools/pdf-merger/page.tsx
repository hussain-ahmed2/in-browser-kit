import { ToolPage } from "@/features/tools/components/ToolPage";
import { PdfMergerPage } from "@/features/pdf-merger/components/PdfMergerPage";

export default function Page() {
  return (
    <ToolPage slug="pdf-merger">
      <PdfMergerPage />
    </ToolPage>
  );
}