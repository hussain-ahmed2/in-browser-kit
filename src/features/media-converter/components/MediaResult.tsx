"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { MediaConversionResult } from "../types";

interface MediaResultProps {
  result: MediaConversionResult;
  onStartOver: () => void;
}

export function MediaResult({ result, onStartOver }: MediaResultProps) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(result.convertedFile);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [result.convertedFile]);

  const isAudio = result.convertedFile.type.startsWith("audio/");
  const isVideo = result.convertedFile.type.startsWith("video/");
  const isImage = result.convertedFile.type.startsWith("image/"); // e.g. GIF

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = result.convertedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!url) return null;

  const isSmaller = result.convertedFile.size < result.originalFile.size;
  const sizeDiffPercent = Math.abs((1 - result.convertedFile.size / result.originalFile.size) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      <div className="rounded-lg overflow-hidden border border-border bg-black flex items-center justify-center p-4 min-h-75">
        {isVideo && (
          <video controls className="max-w-full max-h-125" src={url} />
        )}
        {isAudio && <audio controls className="w-full max-w-md" src={url} />}
        {isImage && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={url}
            alt="Converted media"
            className="max-w-full max-h-125 object-contain"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground flex flex-col gap-1">
          <div>
            Converted to{" "}
            <span className="font-semibold text-foreground uppercase">
              {result.convertedFile.name.split(".").pop()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="opacity-70">{(result.originalFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <ArrowRight className="w-3 h-3 opacity-50" />
            <span className="font-medium text-foreground">{(result.convertedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${isSmaller ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
              {isSmaller ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {sizeDiffPercent}%
            </span>
          </div>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onStartOver}
            className="flex-1 sm:flex-none"
          >
            <RefreshCw />
            Start Over
          </Button>
          <Button
            onClick={handleDownload}
            variant="success"
            className="flex-1 sm:flex-none"
          >
            <Download />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
