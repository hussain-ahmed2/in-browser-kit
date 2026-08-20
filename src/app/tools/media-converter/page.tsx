import { Metadata } from "next";
import { getToolBySlug } from "@/features/tools/tool-registry";
import { MediaConverterPage } from "@/features/media-converter/components/MediaConverterPage";

const tool = getToolBySlug("media-converter");

export const metadata: Metadata = {
    title: tool?.name || "Media Converter",
    description: tool?.tagline,
};

export default function Page() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4 animate-fade-in-up">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
                    {tool?.name}
                </h1>
                <p className="text-xl text-muted-foreground">
                    {tool?.tagline}
                </p>
            </div>
            
            <MediaConverterPage />
        </div>
    );
}
