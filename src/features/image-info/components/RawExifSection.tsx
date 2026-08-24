"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { Hash } from "lucide-react";
import type { ImageInfo } from "../lib/imageInfo";

interface RawExifSectionProps {
  rawExif: ImageInfo["rawExif"];
}

export function RawExifSection({ rawExif }: RawExifSectionProps) {
  if (!rawExif) return null;

  return (
    <CollapsibleSection title="Raw EXIF (All Tags)" icon={<Hash />} defaultOpen={false}>
      <pre className="text-xs font-mono text-muted-foreground bg-secondary/50 p-3 rounded max-h-60 overflow-auto break-all">
        {JSON.stringify(rawExif, null, 2)}
      </pre>
    </CollapsibleSection>
  );
}