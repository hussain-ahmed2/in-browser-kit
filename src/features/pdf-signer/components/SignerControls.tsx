"use client";

import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldContent,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Loader2, Download, Settings2 } from "lucide-react";
import type { SignerSettings } from "../hooks/useSignerPreview";

export interface SignerControlsProps {
  settings: SignerSettings;
  onChange: (settings: Partial<SignerSettings>) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export function SignerControls({
  settings,
  onChange,
  isProcessing,
  onProcess,
}: SignerControlsProps) {
  const { scale } = settings;

  return (
    <div className="w-full lg:w-[320px] shrink-0 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Settings2 className="w-4 h-4" /> Stamp Settings
      </h3>
      <FieldGroup className="gap-5">
        <Field>
          <FieldLabel>Scale: {Math.round(scale * 100)}%</FieldLabel>
          <FieldContent>
            <Slider
              min={0.1}
              max={2}
              step={0.1}
              value={[scale]}
              onValueChange={([val]) => onChange({ scale: val })}
            />
          </FieldContent>
        </Field>
      </FieldGroup>

      <div className="pt-6 border-t border-border">
        <Button
          onClick={onProcess}
          disabled={isProcessing || !settings.signatureImage}
          className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Signing...
            </>
          ) : (
            <>
              <Download aria-hidden="true" data-icon="inline-start" />
              Sign Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
