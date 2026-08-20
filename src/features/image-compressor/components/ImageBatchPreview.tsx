"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Trash2 } from "lucide-react";

interface ImageBatchPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
  onClearAll: () => void;
}

export function ImageBatchPreview({
  files,
  onRemove,
  onClearAll,
}: ImageBatchPreviewProps) {
  const [objectUrls, setObjectUrls] = useState<Record<number, string>>({});

  useEffect(() => {
    const urls: Record<number, string> = {};
    files.forEach((file, idx) => {
      urls[idx] = URL.createObjectURL(file);
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrls(urls);

    return () => {
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const totalSize = files.reduce((acc, file) => acc + file.size, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm">
        <div>
          <p className="font-semibold text-sm">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          <p className="text-xs text-muted-foreground">
            Total size: {formatSize(totalSize)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4 mr-1.5" />
          Clear All
        </Button>
      </div>

      <div className="max-h-70 overflow-y-auto rounded-md border border-border bg-secondary/20 p-2 space-y-2 scrollbar-thin scrollbar-thumb-border">
        {files.map((file, idx) => (
          <div
            key={`${file.name}-${idx}`}
            className="flex items-center justify-between p-2 rounded bg-card border border-border hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              {objectUrls[idx] && (
                <div className="relative w-10 h-10 rounded overflow-hidden bg-secondary ring-1 ring-border shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={objectUrls[idx]}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="min-w-0">
                <p
                  className="font-medium text-sm truncate max-w-37.5 sm:max-w-62.5"
                  title={file.name}
                >
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(idx)}
              className="text-muted-foreground hover:text-destructive shrink-0 px-2 h-7"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
