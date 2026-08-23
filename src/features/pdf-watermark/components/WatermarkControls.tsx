"use client";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, RotateCcw } from "lucide-react";
import type { WatermarkSettings } from "../hooks/useWatermarkPreview";

export interface WatermarkControlsProps {
  settings: WatermarkSettings;
  onChange: (settings: Partial<WatermarkSettings>) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export function WatermarkControls({
  settings,
  onChange,
  isProcessing,
  onProcess,
}: WatermarkControlsProps) {
  const { watermarkText, color, opacity, rotation, size, anchor } = settings;

  return (
    <div className="w-full lg:w-[320px] shrink-0 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <RotateCcw className="w-4 h-4" /> Watermark Settings
      </h3>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel>Text</FieldLabel>
          <FieldContent>
            <InputGroup>
              <InputGroupInput
                value={watermarkText}
                onChange={(e) => onChange({ watermarkText: e.target.value })}
                placeholder="e.g. CONFIDENTIAL"
              />
            </InputGroup>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Position</FieldLabel>
          <FieldContent>
            <Select value={anchor} onValueChange={(val) => onChange({ anchor: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top-left">Top Left</SelectItem>
                <SelectItem value="top-center">Top Center</SelectItem>
                <SelectItem value="top-right">Top Right</SelectItem>
                <SelectItem value="middle-left">Middle Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="middle-right">Middle Right</SelectItem>
                <SelectItem value="bottom-left">Bottom Left</SelectItem>
                <SelectItem value="bottom-center">Bottom Center</SelectItem>
                <SelectItem value="bottom-right">Bottom Right</SelectItem>
              </SelectContent>
            </Select>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Color</FieldLabel>
          <FieldContent>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => onChange({ color: e.target.value })}
                className="h-9 w-14 rounded cursor-pointer border border-border bg-transparent p-1"
              />
              <span className="text-sm text-muted-foreground uppercase">
                {color}
              </span>
            </div>
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Opacity: {Math.round(opacity * 100)}%</FieldLabel>
          <FieldContent>
            <Slider
              min={0.05}
              max={1}
              step={0.05}
              value={[opacity]}
              onValueChange={(v) => onChange({ opacity: v[0] })}
              className="py-2"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Rotation: {rotation}°</FieldLabel>
          <FieldContent>
            <Slider
              min={-180}
              max={180}
              step={5}
              value={[rotation]}
              onValueChange={(v) => onChange({ rotation: v[0] })}
              className="py-2"
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel>Font Size: {size}pt</FieldLabel>
          <FieldContent>
            <Slider
              min={12}
              max={150}
              step={2}
              value={[size]}
              onValueChange={(v) => onChange({ size: v[0] })}
              className="py-2"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="pt-6 border-t border-border">
        <Button
          onClick={onProcess}
          disabled={isProcessing || !watermarkText.trim()}
          className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <Download aria-hidden="true" data-icon="inline-start" />
              Download PDF
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
