"use client";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldContent,
  FieldDescription,
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
import { Loader2, Download, ListOrdered } from "lucide-react";
import type { PageNumberSettings } from "../hooks/usePageNumbersPreview";

export interface PageNumberControlsProps {
  settings: PageNumberSettings;
  onChange: (settings: Partial<PageNumberSettings>) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export function PageNumberControls({
  settings,
  onChange,
  isProcessing,
  onProcess,
}: PageNumberControlsProps) {
  const { format, color, size, anchor, margin } = settings;

  const presets = [
    "Page {n} of {total}",
    "{n} of {total}",
    "{n} / {total}",
    "Page {n}",
    "{n}",
    "- {n} -",
  ];
  const isPreset = presets.includes(format);
  const selectValue = isPreset ? format : "custom";

  return (
    <div className="w-full lg:w-[320px] shrink-0 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <ListOrdered className="w-4 h-4" /> Numbering Settings
      </h3>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel>Format Style</FieldLabel>
          <FieldContent className="space-y-3">
            <Select
              value={selectValue}
              onValueChange={(val) => {
                if (val !== "custom") {
                  onChange({ format: val });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Custom Format..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Page {n} of {total}">Page 1 of 10</SelectItem>
                <SelectItem value="{n} of {total}">1 of 10</SelectItem>
                <SelectItem value="{n} / {total}">1 / 10</SelectItem>
                <SelectItem value="Page {n}">Page 1</SelectItem>
                <SelectItem value="{n}">1 (Number only)</SelectItem>
                <SelectItem value="- {n} -">- 1 -</SelectItem>
                <SelectItem value="custom">Custom Format...</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-1.5">
              <InputGroup>
                <InputGroupInput
                  value={format}
                  onChange={(e) => onChange({ format: e.target.value })}
                  placeholder="e.g. Page {n} of {total}"
                />
              </InputGroup>
              <FieldDescription>
                Customize the text. Use <code>{`{n}`}</code> for current page and <code>{`{total}`}</code> for total pages.
              </FieldDescription>
            </div>
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
          <FieldLabel>Font Size: {size}pt</FieldLabel>
          <FieldContent>
            <Slider
              min={8}
              max={72}
              step={1}
              value={[size]}
              onValueChange={(v) => onChange({ size: v[0] })}
              className="py-2"
            />
          </FieldContent>
        </Field>
        <Field>
          <FieldLabel>Margin: {margin}pt</FieldLabel>
          <FieldContent>
            <Slider
              min={0}
              max={200}
              step={1}
              value={[margin]}
              onValueChange={(v) => onChange({ margin: v[0] })}
              className="py-2"
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="pt-6 border-t border-border">
        <Button
          onClick={onProcess}
          disabled={isProcessing || !format.trim()}
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
