"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { Camera, Aperture, Palette, Hash } from "lucide-react";

interface ExifData {
  make?: string
  model?: string
  software?: string
  dateTime?: string
  dateTimeOriginal?: string
  dateTimeDigitized?: string
  exposureTime?: string
  fNumber?: string
  iso?: number
  focalLength?: string
  lensModel?: string
  flash?: string
  whiteBalance?: string
  meteringMode?: string
  exposureMode?: string
  exposureProgram?: string
  orientation?: number
  gps?: {
    latitude?: number
    longitude?: number
    altitude?: number
    latitudeRef?: string
    longitudeRef?: string
  }
}

interface ExifSectionProps {
  exif: ExifData | undefined;
}

export function ExifSection({ exif }: ExifSectionProps) {
  if (!exif) return null;

  return (
    <CollapsibleSection title="Camera & Exposure" icon={<Camera />}>
      <InfoRow label="Make" value={exif.make} icon={<Camera />} />
      <InfoRow label="Model" value={exif.model} icon={<Camera />} />
      <InfoRow label="Software" value={exif.software} icon={<Hash />} />
      <InfoRow label="Date/Time" value={exif.dateTime} icon={<Hash />} />
      <InfoRow label="Date Taken" value={exif.dateTimeOriginal} icon={<Camera />} />
      <InfoRow label="Date Digitized" value={exif.dateTimeDigitized} icon={<Hash />} />
      <InfoRow label="Exposure" value={exif.exposureTime} icon={<Aperture />} />
      <InfoRow label="Aperture" value={exif.fNumber} icon={<Aperture />} />
      <InfoRow label="ISO" value={exif.iso ? `ISO ${exif.iso}` : undefined} icon={<Aperture />} />
      <InfoRow label="Focal Length" value={exif.focalLength} icon={<Aperture />} />
      <InfoRow label="Lens" value={exif.lensModel} icon={<Camera />} />
      <InfoRow label="Flash" value={exif.flash} icon={<Aperture />} />
      <InfoRow label="White Balance" value={exif.whiteBalance} icon={<Palette />} />
      <InfoRow label="Metering Mode" value={exif.meteringMode} icon={<Aperture />} />
      <InfoRow label="Exposure Mode" value={exif.exposureMode} icon={<Aperture />} />
      <InfoRow label="Exposure Program" value={exif.exposureProgram} icon={<Aperture />} />
      <InfoRow label="Orientation" value={exif.orientation ? `Rotation ${exif.orientation}` : undefined} icon={<Hash />} />
    </CollapsibleSection>
  );
}