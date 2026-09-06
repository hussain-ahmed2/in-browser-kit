"use client";

import { useCallback, useState } from "react";
import { Loader2, Download, RotateCcw, Copy, Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import { extractPalette } from "../lib/imageColorPalette";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fileSelected,
  colorCountSet,
  processingSet,
  paletteSet,
  clearAll,
} from "../colorPaletteSlice";

const steps = [
  { label: "Upload" },
  { label: "Extract" },
  { label: "Export" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 w-7 p-0">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

export function ImageColorPalettePage() {
  const dispatch = useAppDispatch();
  const { item, palette, colorCount, isProcessing } = useAppSelector(
    (state) => state.imageColorPalette
  );

  const currentStep = palette ? 2 : item ? 1 : 0;

  const handleFiles = useCallback(
    async (files: File[]) => {
      const selected = files[0];
      if (!selected) return;
      const previewUrl = URL.createObjectURL(selected);
      dispatch(fileSelected({ file: selected, previewUrl }));
    },
    [dispatch]
  );

  const handleClear = useCallback(() => {
    dispatch(clearAll());
  }, [dispatch]);

  const handleExtract = async () => {
    if (!item) return;
    dispatch(processingSet(true));
    try {
      const res = await extractPalette(item.file, colorCount);
      dispatch(paletteSet(res));
      toast.success("Palette extracted successfully!");
    } catch {
      toast.error("Error extracting palette");
      dispatch(processingSet(false));
    }
  };

  const handleColorCountChange = (value: number) => {
    dispatch(colorCountSet(value));
  };

  const handleExportCSS = () => {
    if (!palette) return;
    const lines = palette.colors.map(
      (c, i) => `  --color-${i + 1}: ${c.hex};`
    );
    const css = `:root {\n${lines.join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette.css";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSS variables exported!");
  };

  const handleDownloadImage = () => {
    if (!palette) return;
    const canvas = document.createElement("canvas");
    const swatchWidth = 80;
    const swatchHeight = 80;
    canvas.width = swatchWidth * palette.colors.length;
    canvas.height = swatchHeight;
    const ctx = canvas.getContext("2d")!;

    palette.colors.forEach((color, i) => {
      ctx.fillStyle = color.hex;
      ctx.fillRect(i * swatchWidth, 0, swatchWidth, swatchHeight);
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "palette.png";
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette />
            Color Palette Generator
          </CardTitle>
          <CardDescription>
            Extract dominant colors from any image and get HEX, RGB, and HSL
            values.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!item ? (
            <FileDropzone
              onFiles={handleFiles}
              accept="image/*"
              multiple={false}
            />
          ) : (
            <div className="animate-fade-in space-y-6">
              {/* Color count selector */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Number of Colors: {colorCount}
                  </label>
                  <input
                    type="range"
                    min={2}
                    max={12}
                    step={1}
                    value={colorCount}
                    onChange={(e) =>
                      handleColorCountChange(Number(e.target.value))
                    }
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-border accent-brand"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2</span>
                    <span>12</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Button
                    onClick={handleExtract}
                    disabled={isProcessing}
                    className="flex-1 bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2
                          className="animate-spin"
                          aria-hidden="true"
                        />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Palette aria-hidden="true" />
                        Extract Palette
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {palette ? (
                <div className="space-y-4 animate-fade-in">
                  {/* Image preview */}
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.previewUrl ?? ""}
                      alt="Source image"
                      className="w-full rounded-lg border border-border max-h-64 object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={handleClear}
                    >
                      Remove
                    </Button>
                  </div>

                  {/* Color swatches */}
                  <div className="grid gap-3">
                    {palette.colors.map((color, i) => (
                      <div
                        key={`${color.hex}-${i}`}
                        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div
                          className="w-12 h-12 rounded-lg border border-border shrink-0 shadow-sm"
                          style={{ backgroundColor: color.hex }}
                        />
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground w-8">HEX</span>
                            <code className="font-mono bg-background px-1.5 py-0.5 rounded">
                              {color.hex.toUpperCase()}
                            </code>
                            <CopyButton text={color.hex.toUpperCase()} />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground w-8">RGB</span>
                            <code className="font-mono bg-background px-1.5 py-0.5 rounded">
                              {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                            </code>
                            <CopyButton
                              text={`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`}
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground w-8">HSL</span>
                            <code className="font-mono bg-background px-1.5 py-0.5 rounded">
                              {color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%
                            </code>
                            <CopyButton
                              text={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`}
                            />
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium shrink-0">
                          {color.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Export bar preview */}
                  <div className="flex rounded-lg overflow-hidden h-8 border border-border">
                    {palette.colors.map((color, i) => (
                      <div
                        key={`bar-${i}`}
                        className="h-full"
                        style={{
                          backgroundColor: color.hex,
                          width: `${color.percentage}%`,
                        }}
                      />
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button onClick={handleExportCSS} className="flex-1">
                      <Download aria-hidden="true" />
                      Export CSS
                    </Button>
                    <Button
                      onClick={handleDownloadImage}
                      variant="outline"
                      className="flex-1"
                    >
                      <Download aria-hidden="true" />
                      Save Swatches
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      className="flex-1"
                    >
                      <RotateCcw />
                      Start Over
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl ?? ""}
                    alt="Preview"
                    className="w-full rounded-lg border border-border max-h-96 object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
