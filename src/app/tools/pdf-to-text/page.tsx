import { PdfToTextPage } from "@/features/pdf-to-text/components/PdfToTextPage";
import { ToolPage } from "@/features/tools/components/ToolPage";

export const metadata = {
  title: "PDF to Text | In-Browser Tools",
  description: "Extract raw text from a PDF document locally in your browser.",
};

export default function Page() {
  return (
    <ToolPage slug="pdf-to-text">
      <PdfToTextPage />
    </ToolPage>
  );
}
