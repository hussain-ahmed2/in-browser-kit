import { ToolPage } from "@/features/tools/components/ToolPage";
import { ZipExtractorPage } from "@/features/zip-extractor/components/ZipExtractorPage";

export default function ZipExtractorRoute() {
  return (
    <ToolPage slug="zip-extractor" maxWidth="container">
      <ZipExtractorPage />
    </ToolPage>
  );
}
