import { ToolPage } from "@/features/tools/components/ToolPage";
import { SvgOptimizerPage } from "@/features/svg-optimizer/components/SvgOptimizerPage";

export default function SvgOptimizerRoute() {
  return (
    <ToolPage slug="svg-optimizer" maxWidth="container">
      <SvgOptimizerPage />
    </ToolPage>
  );
}
