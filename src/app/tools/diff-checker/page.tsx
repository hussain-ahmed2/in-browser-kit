import { ToolPage } from "@/features/tools/components/ToolPage";
import { DiffCheckerPage } from "@/features/diff-checker/components/DiffCheckerPage";

export default function DiffCheckerRoute() {
  return (
    <ToolPage slug="diff-checker" maxWidth="container">
      <DiffCheckerPage />
    </ToolPage>
  );
}
