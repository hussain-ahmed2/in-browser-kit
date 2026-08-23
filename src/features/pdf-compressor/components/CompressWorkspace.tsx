"use client";

import { Button } from "@/components/ui/button";
import { CompressOptions } from "./CompressOptions";
import type { CompressConfig } from "../hooks/usePdfCompressor";
import { formatFileSize } from "../hooks/usePdfCompressor";
import { FileArchive, Loader2 } from "lucide-react";

interface CompressWorkspaceProps {
  file: File;
  originalSize: number;
  config: CompressConfig;
  isProcessing: boolean;
  renderProgress: { current: number; total: number } | null;
  onConfigChange: (config: CompressConfig) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function CompressWorkspace({
  file,
  originalSize,
  config,
  isProcessing,
  renderProgress,
  onConfigChange,
  onClear,
  onSubmit,
}: CompressWorkspaceProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-medium truncate line-clamp-1 block">
            {file.name}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatFileSize(originalSize)}
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear}>
          Change File
        </Button>
      </div>

      {/* Options Panel */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-1/2 flex justify-center bg-muted/20 border border-border p-6 rounded-xl min-h-60">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <FileArchive className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Ready to Compress</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a compression mode, then click Compress to reduce the
                file size.
              </p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 space-y-6 p-6 bg-card border border-border rounded-xl shadow-sm">
          <div className="border-b border-border pb-4">
            <h3 className="font-medium text-lg">Compression Options</h3>
          </div>

          <CompressOptions config={config} onConfigChange={onConfigChange} />

          <Button
            size="lg"
            className="w-full"
            onClick={onSubmit}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {renderProgress
                  ? `Rendering page ${renderProgress.current} of ${renderProgress.total}...`
                  : "Compressing..."}
              </>
            ) : (
              "Compress PDF"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
