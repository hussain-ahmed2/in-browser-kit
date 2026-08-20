"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  ArrowDownToLine,
  Loader2,
  FileArchive,
  Eye,
  EyeOff,
} from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CompressionResult } from "../types";
import JSZip from "jszip";

interface CompressedBatchResultProps {
  results: CompressionResult[];
  onTweakSettings: () => void;
}

export function CompressedBatchResult({ results, onTweakSettings }: CompressedBatchResultProps) {
  const [isZipping, setIsZipping] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const totalOriginalSize = results.reduce(
    (acc, r) => acc + r.originalFile.size,
    0,
  );
  const totalCompressedSize = results.reduce(
    (acc, r) => acc + r.compressedFile.size,
    0,
  );

  const reductionPercent = Math.max(
    0,
    Math.round((1 - totalCompressedSize / totalOriginalSize) * 100),
  );

  const handleDownloadSingle = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `compressed_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      const nameCounts: Record<string, number> = {};

      results.forEach((r) => {
        let name = r.compressedFile.name;
        if (nameCounts[name]) {
          nameCounts[name]++;
          const extIdx = name.lastIndexOf(".");
          if (extIdx !== -1) {
            name = `${name.substring(0, extIdx)}_${nameCounts[name]}${name.substring(extIdx)}`;
          } else {
            name = `${name}_${nameCounts[name]}`;
          }
        } else {
          nameCounts[name] = 1;
        }

        zip.file(name, r.compressedFile);
      });

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `compressed_images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate zip", error);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert variant="success">
        <ArrowDownToLine className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Compression Complete!</AlertTitle>
        <AlertDescription className="mt-2 text-foreground">
          Total New Size: {formatSize(totalCompressedSize)}
          <span className="ml-2 text-success font-semibold">
            (-{reductionPercent}%)
          </span>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Original: {formatSize(totalOriginalSize)}</span>
          <span>Compressed: {formatSize(totalCompressedSize)}</span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex ring-1 ring-border/50">
          <div
            className="h-full bg-linear-to-r from-brand/60 to-glow/50 transition-all duration-700 ease-out"
            style={{ width: `${100 - reductionPercent}%` }}
          />
          <div
            className="h-full bg-linear-to-r from-success/70 to-success transition-all duration-700 ease-out"
            style={{ width: `${reductionPercent}%` }}
          />
        </div>
        <p className="text-xs text-center text-success font-medium">
          {reductionPercent}% smaller overall
        </p>
      </div>

      <div className="max-h-100 overflow-y-auto rounded-md border border-border bg-secondary/20 p-2 space-y-2 scrollbar-thin scrollbar-thumb-border">
        {results.map((r, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={`${r.originalFile.name}-${idx}`}
              className="flex flex-col p-2 rounded bg-card border border-border hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p
                    className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px]"
                    title={r.compressedFile.name}
                  >
                    {r.compressedFile.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span className="line-through opacity-70">
                      {formatSize(r.originalFile.size)}
                    </span>
                    <span>→</span>
                    <span className="text-success font-medium">
                      {formatSize(r.compressedFile.size)}
                    </span>
                    <span className="text-muted-foreground/50 mx-1">•</span>
                    <span className="capitalize">{r.compressedFile.type.split("/")[1] || "unknown"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    aria-label="Toggle comparison"
                  >
                    {isExpanded ? (
                      <EyeOff className="size-3.5 sm:mr-1.5" />
                    ) : (
                      <Eye className="size-3.5 sm:mr-1.5" />
                    )}
                    <span className="hidden sm:inline">
                      {isExpanded ? "Hide" : "Compare"}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadSingle(r.compressedFile)}
                    className="h-8"
                    aria-label={`Download ${r.compressedFile.name}`}
                  >
                    <Download className="size-3.5 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Original
                    </p>
                    <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(r.originalFile)}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Compressed
                    </p>
                    <div className="relative rounded-lg overflow-hidden bg-secondary border border-border aspect-video">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={URL.createObjectURL(r.compressedFile)}
                        alt="Compressed"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={onTweakSettings}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Tweak Settings &amp; Recompress
        </Button>

        <div className="flex justify-end gap-4 w-full sm:w-auto order-1 sm:order-2">
          {results.length === 1 ? (
            <Button
              onClick={() => handleDownloadSingle(results[0].compressedFile)}
              className="w-full sm:w-auto"
              variant="success"
            >
              <Download className="size-4 mr-2" />
              Download Image
            </Button>
          ) : (
            <Button
              onClick={handleDownloadAllZip}
              disabled={isZipping}
              className="w-full sm:w-auto"
              variant="success"
            >
              {isZipping ? (
                <>
                  <Loader2 className="animate-spin size-4 mr-2" />
                  Zipping...
                </>
              ) : (
                <>
                  <FileArchive className="size-4 mr-2" />
                  Download All (ZIP)
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
