"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  file: File;
  previewUrl: string | null;
  onClear: () => void;
}

export function ImagePreview({ file, previewUrl, onClear }: ImagePreviewProps) {
  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border shadow-sm group hover:bg-accent/30 transition-colors">
      <div className="flex items-center gap-4">
        {previewUrl ? (
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary ring-1 ring-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={`Preview of ${file.name}`} className="object-cover w-full h-full" />
          </div>
        ) : null}
        <div>
          <p className="font-medium truncate max-w-[200px] sm:max-w-xs" title={file.name}>
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-sm text-muted-foreground">{formatSize(file.size)}</p>
            <span className="text-xs text-muted-foreground/50">•</span>
            <p className="text-sm text-muted-foreground capitalize">{file.type.split("/")[1]}</p>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        aria-label="Change selected image"
        className="text-muted-foreground hover:text-destructive"
      >
        <X className="size-4" />
        <span className="hidden sm:inline">Change</span>
      </Button>
    </div>
  );
}
