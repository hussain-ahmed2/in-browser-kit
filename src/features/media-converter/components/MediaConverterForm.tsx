import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/form/select-field";
import { InputField } from "@/components/form/input-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import type { MediaConversionFormValues } from "../types";
import {
  OUTPUT_FORMAT_OPTIONS_VIDEO,
  OUTPUT_FORMAT_OPTIONS_AUDIO,
  RESOLUTION_OPTIONS,
  QUALITY_OPTIONS,
  VIDEO_CODEC_OPTIONS,
  FILTER_OPTIONS,
  SAVE_MODE_OPTIONS,
} from "../constants";

interface MediaConverterFormProps {
  isVideo: boolean;
  webCodecsSupported: boolean;
  isConverting: boolean;
  isHardwareEncoding: boolean;
  isFfmpegLoaded: boolean;
  progress: number;
  logs: string;
  onConvert: (values: MediaConversionFormValues) => void;
}

export function MediaConverterForm({
  isVideo,
  webCodecsSupported,
  isConverting,
  isHardwareEncoding,
  isFfmpegLoaded,
  progress,
  logs,
  onConvert,
}: MediaConverterFormProps) {
  const form = useFormContext<MediaConversionFormValues>();

  return (
    <form onSubmit={form.handleSubmit(onConvert)} className="space-y-6">
      <div className="p-8 rounded-xl bg-secondary/30 border border-border">
        <FieldGroup>
          <FieldSet className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <SelectField
              name="outputFormat"
              label="Output Format"
              options={isVideo ? OUTPUT_FORMAT_OPTIONS_VIDEO : OUTPUT_FORMAT_OPTIONS_AUDIO}
            />
            {isVideo && (
              <SelectField
                name="resolution"
                label="Resolution (Resize)"
                options={RESOLUTION_OPTIONS}
              />
            )}
            
            <SelectField
              name="quality"
              label="Quality"
              options={QUALITY_OPTIONS}
            />
            {isVideo && (
              <SelectField
                name="videoCodec"
                label="Video Codec"
                options={VIDEO_CODEC_OPTIONS}
              />
            )}
            
            {isVideo && (
              <SelectField
                name="filter"
                label="Visual Filter"
                options={FILTER_OPTIONS}
              />
            )}
            <SelectField
              name="saveMode"
              label="Save Mode (Memory Efficiency)"
              options={SAVE_MODE_OPTIONS}
            />
            
            <InputField
              name="trimStart"
              label="Trim Start (e.g. 00:00:05)"
              placeholder="Optional"
            />
            <InputField
              name="trimEnd"
              label="Trim End (e.g. 00:00:15)"
              placeholder="Optional"
            />
          </FieldSet>
          
          {webCodecsSupported && isVideo && (
            <div className="mt-6 pt-6 border-t border-border">
              <CheckboxField
                name="useHardwareAcceleration"
                label="Hardware Acceleration (WebCodecs)"
                description="Uses your device's native GPU encoder for massive speedups (5x-10x) and lower battery usage. If it fails, it safely falls back to CPU."
              />
            </div>
          )}
        </FieldGroup>
      </div>

      <div className="flex flex-col gap-4">
        {isConverting && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center truncate opacity-70">
              {logs}
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isConverting}
            className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
          >
            {isConverting ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                {isHardwareEncoding
                  ? "Hardware Encoding..."
                  : !isFfmpegLoaded
                  ? "Loading Engine..."
                  : "Converting..."}
              </>
            ) : (
              "Convert File"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
