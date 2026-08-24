"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { Hash, Info, Image as ImageIcon } from "lucide-react";
import { formatBytes } from "../lib/imageInfo";
import type { ImageInfo } from "../lib/imageInfo";

interface FileInfoSectionProps {
  info: ImageInfo;
}

export function FileInfoSection({ info }: FileInfoSectionProps) {
  return (
    <CollapsibleSection title="File Information" icon={<Hash />} defaultOpen>
      <InfoRow label="File Name" value={info.fileName} icon={<Hash />} />
      <InfoRow label="File Size" value={formatBytes(info.fileSize)} icon={<Hash />} />
      <InfoRow label="MIME Type" value={info.mimeType} icon={<Info />} />
      <InfoRow label="Dimensions" value={`${info.width} × ${info.height}`} icon={<ImageIcon />} />
      <InfoRow label="Aspect Ratio" value={info.aspectRatio} icon={<ImageIcon />} />
    </CollapsibleSection>
  );
}