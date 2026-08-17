import { PdfMergerPage } from "@/features/pdf-merger/components/PdfMergerPage";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export default function Page() {
  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs items={[{ label: "PDF Merger" }]} />
      </div>
      <PdfMergerPage />
    </div>
  );
}
