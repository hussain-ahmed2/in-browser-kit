"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { Palette, Hash } from "lucide-react";
import type { ImageInfo } from "../lib/imageInfo";

interface ColorInfoSectionProps {
  info: ImageInfo;
}

export function ColorInfoSection({ info }: ColorInfoSectionProps) {
  return (
    <CollapsibleSection title="Color Information" icon={<Palette />} defaultOpen>
      <InfoRow label="Color Space" value={info.colorSpace} icon={<Palette />} />
      <InfoRow label="Bit Depth" value={info.bitDepth ? `${info.bitDepth}-bit` : undefined} icon={<Hash />} />
      <InfoRow label="Channels" value={info.channels} icon={<Palette />} />
    </CollapsibleSection>
  );
}