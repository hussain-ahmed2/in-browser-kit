import { PdfFlattenPage } from "@/features/pdf-flatten/components/PdfFlattenPage";
import { ToolPage } from "@/features/tools/components/ToolPage";

export const metadata = {
  title: "Flatten PDF | In-Browser Tools",
  description: "Burn interactive form fields and annotations into the PDF layers so they cannot be edited.",
};

export default function Page() {
  return (
    <ToolPage slug="pdf-flatten">
      <PdfFlattenPage />
    </ToolPage>
  );
}
