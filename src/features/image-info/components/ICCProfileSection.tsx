"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { Palette, Hash, Camera, Aperture, Info } from "lucide-react";

interface ICCProfileData {
  description?: string
  manufacturer?: string
  model?: string
  colorSpace?: string
  renderingIntent?: number
  connectionSpace?: string
}

interface ICCProfileSectionProps {
  iccProfile: ICCProfileData | undefined;
}

export function ICCProfileSection({ iccProfile }: ICCProfileSectionProps) {
  if (!iccProfile) return null;

  return (
    <CollapsibleSection title="ICC Profile" icon={<Palette />}>
      <InfoRow
        label="Description"
        value={iccProfile.description}
        icon={<Info />}
      />
      <InfoRow
        label="Manufacturer"
        value={iccProfile.manufacturer}
        icon={<Hash />}
      />
      <InfoRow label="Model" value={iccProfile.model} icon={<Camera />} />
      <InfoRow
        label="Color Space"
        value={iccProfile.colorSpace}
        icon={<Palette />}
      />
      <InfoRow
        label="Rendering Intent"
        value={iccProfile.renderingIntent}
        icon={<Aperture />}
      />
      <InfoRow
        label="Connection Space"
        value={iccProfile.connectionSpace}
        icon={<Hash />}
      />
    </CollapsibleSection>
  );
}
