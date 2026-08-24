"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { Image as ImageIcon } from "lucide-react";
import type { ImageInfo } from "../lib/imageInfo";

interface ResolutionSectionProps {
  info: ImageInfo;
}

export function ResolutionSection({ info }: ResolutionSectionProps) {
  return (
    <CollapsibleSection title="Resolution" icon={<ImageIcon />} defaultOpen>
      <InfoRow
        label="DPI"
        value={
          info.dpi
            ? `${Math.round(info.dpi.x)} × ${Math.round(info.dpi.y)}`
            : undefined
        }
        icon={<ImageIcon />}
      />
      <InfoRow
        label="PPI"
        value={
          info.ppi
            ? `${Math.round(info.ppi.x)} × ${Math.round(info.ppi.y)}`
            : undefined
        }
        icon={<ImageIcon />}
      />
    </CollapsibleSection>
  );
}
