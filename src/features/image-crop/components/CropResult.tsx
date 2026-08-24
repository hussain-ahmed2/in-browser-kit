"use client";

import { Crop, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CropResult as CropResultType } from "../lib/imageCrop";
import { clearAll } from "../cropSlice";
import { useAppDispatch } from "@/store/hooks";

interface CropResultProps {
  result: CropResultType;
  onDownload: () => void;
}

export function CropResult({ result, onDownload }: CropResultProps) {
  const dispatch = useAppDispatch();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={result.objectUrl}
        alt="Cropped"
        className="w-full rounded-lg border border-border max-h-96 object-contain"
      />
      <div className="flex gap-4">
        <Button onClick={onDownload} className="flex-1">
          <Crop aria-hidden="true" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch(clearAll())}
          className="flex-1"
        >
          <RotateCcw />
          Start Over
        </Button>
      </div>
    </div>
  );
}
