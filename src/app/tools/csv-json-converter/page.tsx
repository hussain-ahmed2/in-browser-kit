import { ToolPage } from "@/features/tools/components/ToolPage";
import { CsvJsonConverterPage } from "@/features/csv-json-converter/components/CsvJsonConverterPage";

export default function CsvJsonConverterRoute() {
  return (
    <ToolPage slug="csv-json-converter" maxWidth="container">
      <CsvJsonConverterPage />
    </ToolPage>
  );
}
