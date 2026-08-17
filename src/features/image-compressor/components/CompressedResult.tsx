"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowDownToLine, ArrowRight } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CompressedResultProps {
  originalFile: File;
  compressedFile: File;
}

export function CompressedResult({ originalFile, compressedFile }: CompressedResultProps) {
  const [showComparison, setShowComparison] = useState(false);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compressed_${compressedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reductionPercent = Math.max(
    0,
    Math.round((1 - compressedFile.size / originalFile.size) * 100)
  );

  const originalUrl = URL.createObjectURL(originalFile);
  const compressedUrl = URL.createObjectURL(compressedFile);

  return (
    <div className="space-y-6">
      <Alert variant="success">
        <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Compression Complete!</AlertTitle>
        <AlertDescription className="mt-2 text-foreground">
          New Size: {formatSize(compressedFile.size)}
          <span className="ml-2 text-success font-semibold">
            (-{reductionPercent}%)
          </span>
        </AlertDescription>
      </Alert>

      {/* Size Comparison Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Original: {formatSize(originalFile.size)}</span>
          <span>Compressed: {formatSize(compressedFile.size)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex ring-1 ring-border/50">
          <div
            className="h-full bg-gradient-to-r from-brand/60 to-glow/50 transition-all duration-700 ease-out"
            style={{ width: `${100 - reductionPercent}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-success/70 to-success transition-all duration-700 ease-out"
            style={{ width: `${reductionPercent}%` }}
          />
        </div>
        <p className="text-xs text-center text-success font-medium">
          {reductionPercent}% smaller
        </p>
      </div>

      {/* Before / After Toggle */}
      {showComparison ? (
        <div className="space-y-3 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Original</p>
              <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={originalUrl} alt="Original" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Compressed</p>
              <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={compressedUrl} alt="Compressed" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowComparison(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto block"
          >
            Hide comparison
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowComparison(true)}
          className="flex items-center gap-1.5 text-xs text-brand hover:underline mx-auto block transition-colors"
        >
          <ArrowRight className="size-3" />
          Compare before &amp; after
        </button>
      )}

      <div className="flex justify-end gap-4 pt-6 border-t border-border">
        <Button
          onClick={handleDownload}
          className="w-full sm:w-auto"
          variant="success"
          aria-label="Download compressed image"
        >
          <Download aria-hidden="true" />
          Download Image
        </Button>
      </div>
    </div>
  );
}
