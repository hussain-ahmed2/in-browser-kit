import { ToolPage } from "@/features/tools/components/ToolPage";
import { CssFormatterPage } from "@/features/css-formatter/components/CssFormatterPage";

export default function CssFormatterRoute() {
  return (
    <ToolPage slug="css-formatter" maxWidth="container">
      <CssFormatterPage />
    </ToolPage>
  );
}
