"use client";

import { type GridType } from "../constants";

interface CropGridOverlayProps {
  gridType: GridType;
  dims: { width: number; height: number } | null;
}

export function CropGridOverlay({ gridType, dims }: CropGridOverlayProps) {
  if (gridType === "none" || !dims) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ left: 0, top: 0, width: "100%", height: "100%" }}
      viewBox={`0 0 ${dims.width} ${dims.height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {gridType === "thirds" && (
        <>
          <line
            x1="33.33%"
            y1="0"
            x2="33.33%"
            y2="100%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
          <line
            x1="66.66%"
            y1="0"
            x2="66.66%"
            y2="100%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
          <line
            x1="0"
            y1="33.33%"
            x2="100%"
            y2="33.33%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
          <line
            x1="0"
            y1="66.66%"
            x2="100%"
            y2="66.66%"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1}
          />
        </>
      )}
      {gridType === "golden" && (
        <>
          <line
            x1="38.2%"
            y1="0"
            x2="38.2%"
            y2="100%"
            stroke="rgba(255,215,0,0.6)"
            strokeWidth={1}
          />
          <line
            x1="61.8%"
            y1="0"
            x2="61.8%"
            y2="100%"
            stroke="rgba(255,215,0,0.6)"
            strokeWidth={1}
          />
          <line
            x1="0"
            y1="38.2%"
            x2="100%"
            y2="38.2%"
            stroke="rgba(255,215,0,0.6)"
            strokeWidth={1}
          />
          <line
            x1="0"
            y1="61.8%"
            x2="100%"
            y2="61.8%"
            stroke="rgba(255,215,0,0.6)"
            strokeWidth={1}
          />
        </>
      )}
      {gridType === "center" && (
        <>
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={1}
            strokeDasharray="8,4"
          />
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(255,255,255,0.8)"
            strokeWidth={1}
            strokeDasharray="8,4"
          />
          <circle
            cx="50%"
            cy="50%"
            r="30"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth={1.5}
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
