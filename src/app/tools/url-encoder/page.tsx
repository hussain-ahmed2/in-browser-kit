import { ToolPage } from "@/features/tools/components/ToolPage";
import { UrlEncoderPage } from "@/features/url-encoder/components/UrlEncoderPage";

export default function UrlEncoderRoute() {
  return (
    <ToolPage slug="url-encoder" maxWidth="container">
      <UrlEncoderPage />
    </ToolPage>
  );
}
