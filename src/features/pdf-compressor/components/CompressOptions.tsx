"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { CompressConfig } from "../hooks/usePdfCompressor";

interface CompressOptionsProps {
  config: CompressConfig;
  onConfigChange: (config: CompressConfig) => void;
}

export function CompressOptions({ config, onConfigChange }: CompressOptionsProps) {
  const isLossy = config.mode === "lossy" || config.mode === "smart";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Compression mode</Label>
        <Select
          value={config.mode}
          onValueChange={(value) =>
            onConfigChange({ ...config, mode: value as CompressConfig["mode"] })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lossless">Lossless (preserves text)</SelectItem>
            <SelectItem value="smart">Smart (auto-select best)</SelectItem>
            <SelectItem value="lossy">Maximum (re-renders pages)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {config.mode === "lossless" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Re-saves the PDF with optimized object streams. Preserves text
            selectability and vector graphics. Typically 15-25% savings.
          </AlertDescription>
        </Alert>
      )}

      {config.mode === "smart" && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Tries lossless first. If savings are less than 20%, re-renders
            pages as images for maximum compression. Text may become
            non-selectable.
          </AlertDescription>
        </Alert>
      )}

      {isLossy && (
        <>
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Image quality</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {Math.round(config.quality * 100)}%
              </span>
            </div>
            <Slider
              value={[config.quality * 100]}
              min={10}
              max={100}
              step={5}
              onValueChange={([val]) =>
                onConfigChange({ ...config, quality: val / 100 })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Render scale</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {config.scale.toFixed(1)}x
              </span>
            </div>
            <Slider
              value={[config.scale * 100]}
              min={50}
              max={300}
              step={25}
              onValueChange={([val]) =>
                onConfigChange({ ...config, scale: val / 100 })
              }
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Smaller file</span>
              <span>Sharper text</span>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Lossy mode renders each page as a JPEG image. Text will no longer
              be selectable or searchable. Best for scanned documents and
              image-heavy PDFs.
            </AlertDescription>
          </Alert>
        </>
      )}
    </div>
  );
}
