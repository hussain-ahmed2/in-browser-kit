import { Metadata } from "next";
import { ToolPage } from "@/features/tools/components/ToolPage";
import { MediaConverterPage } from "@/features/media-converter/components/MediaConverterPage";
import { toolMetadata } from "@/lib/site";
import { StructuredData } from "@/components/StructuredData";

export const metadata: Metadata = toolMetadata("media-converter");

export default function Page() {
    return (
        <ToolPage slug="media-converter">
            <StructuredData
              name="Media Converter"
              description="Convert video and audio formats natively in your browser."
              url={`${typeof window !== "undefined" ? window.location.origin : "https://inbrowserkit.netlify.app"}/tools/media-converter`}
              category="Utilities"
            />
            <MediaConverterPage />
        </ToolPage>
    );
}
