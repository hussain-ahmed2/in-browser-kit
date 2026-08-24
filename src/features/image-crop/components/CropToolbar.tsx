"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";
import {
  aspectRatioSet,
  customRatioSet,
  gridTypeSet,
  showPreviewSet,
} from "../cropSlice";
import { PRESET_RATIOS, GRID_OPTIONS } from "../constants";

export function CropToolbar() {
  const dispatch = useAppDispatch();
  const { aspectRatio, customRatio, gridType, showPreview } = useAppSelector(
    (state) => state.imageCrop,
  );

  return (
    <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
        <div className="flex flex-wrap gap-2">
          {PRESET_RATIOS.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={aspectRatio === preset.value ? "default" : "outline"}
              size="sm"
              className="min-w-22.5"
              onClick={() => dispatch(aspectRatioSet(preset.value))}
              title={preset.desc}
            >
              {preset.label}
            </Button>
          ))}
          <Button
            type="button"
            variant={aspectRatio === "custom" ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch(aspectRatioSet("custom"))}
          >
            Custom
          </Button>
        </div>
        {aspectRatio === "custom" && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              placeholder="2:1 or 1.5"
              value={customRatio}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                dispatch(customRatioSet(e.target.value))
              }
              className="flex-1 max-w-xs h-10 px-3 rounded-lg bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Grid Overlay</label>
        <div className="flex flex-wrap gap-2">
          {GRID_OPTIONS.map((g) => (
            <Button
              key={g.value}
              type="button"
              variant={gridType === g.value ? "default" : "outline"}
              size="sm"
              onClick={() => dispatch(gridTypeSet(g.value))}
            >
              {g.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={showPreview ? "default" : "outline"}
          size="sm"
          onClick={() => dispatch(showPreviewSet(!showPreview))}
        >
          {showPreview ? <Minimize2 /> : <Maximize2 />}
          Live Preview
        </Button>
        <span className="text-xs text-muted-foreground ml-auto">
          Arrows: move · Shift: 10px · [ ]: resize
        </span>
      </div>
    </div>
  );
}
