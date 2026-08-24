"use client";

import { CollapsibleSection } from "./CollapsibleSection";
import { InfoRow } from "./InfoRows";
import { MapPin } from "lucide-react";

interface GPSData {
  latitude?: number;
  longitude?: number;
  altitude?: number;
  latitudeRef?: string;
  longitudeRef?: string;
}

interface GPSSectionProps {
  gps: GPSData | undefined;
}

export function GPSSection({ gps }: GPSSectionProps) {
  if (!gps) return null;

  return (
    <CollapsibleSection title="GPS Location" icon={<MapPin />}>
      <InfoRow
        label="Latitude"
        value={gps.latitude?.toFixed(6)}
        icon={MapPin}
      />
      <InfoRow
        label="Longitude"
        value={gps.longitude?.toFixed(6)}
        icon={MapPin}
      />
      <InfoRow
        label="Altitude"
        value={gps.altitude ? `${gps.altitude}m` : undefined}
        icon={MapPin}
      />
      {gps.latitude !== undefined && gps.longitude !== undefined && (
        <div className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
          <MapPin className="text-muted-foreground size-4" />
          <span className="text-sm text-muted-foreground min-w-35">
            Google Maps
          </span>
          <span className="text-sm font-mono text-primary flex-1 break-all">
            {`https://maps.google.com/?q=${gps.latitude},${gps.longitude}`}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(
                `https://maps.google.com/?q=${gps.latitude},${gps.longitude}`,
              );
            }}
            className="text-muted-foreground hover:text-green-500"
            title="Copy"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
        </div>
      )}
    </CollapsibleSection>
  );
}
