"use client";

import { Button } from "@/components/ui/button";
import { formatBytes } from "../lib/imageInfo";
import type { ImageInfo } from "../lib/imageInfo";

interface ImagePreviewProps {
  previewUrl: string | null;
  dimensions: { width: number; height: number } | null;
  info: ImageInfo;
  onClear: () => void;
  onDownloadJson: () => void;
  onCopyAll: () => void;
}

export function ImagePreview({
  previewUrl,
  dimensions,
  info,
  onClear,
  onDownloadJson,
  onCopyAll,
}: ImagePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="relative group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl ?? ""}
          alt="Preview"
          className="w-full rounded-lg border border-border max-h-96 object-contain"
        />
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={onClear}
        >
          Remove
        </Button>
      </div>

      {dimensions && (
        <p className="text-sm text-muted-foreground text-center">
          {dimensions.width}×{dimensions.height} • {formatBytes(info.fileSize)}
        </p>
      )}

      <div className="flex gap-2">
        <Button onClick={onDownloadJson} className="flex-1">
          <svg
            className="size-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download JSON
        </Button>
        <Button variant="outline" onClick={onCopyAll} className="flex-1">
          <svg
            className="size-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy All JSON
        </Button>
      </div>
    </div>
  );
}
