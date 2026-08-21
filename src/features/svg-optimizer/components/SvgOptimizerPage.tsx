"use client";

import { useState, useEffect } from "react";
import { optimize } from "svgo/browser";
import { Copy, Trash2, AlertCircle, Check, Play, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

export function SvgOptimizerPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [multipass, setMultipass] = useState(true);
  
  const [inputSize, setInputSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setInputSize(0);
    setOutputSize(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setInput(evt.target?.result as string);
    };
    reader.readAsText(file);
    // Reset input so the same file can be re-uploaded
    e.target.value = "";
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const processSvg = () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      setInputSize(0);
      setOutputSize(0);
      return;
    }

    try {
      const result = optimize(input, {
        multipass: multipass,
        plugins: ["preset-default"],
      });

      setOutput(result.data);
      setError(null);
      
      const encoder = new TextEncoder();
      setInputSize(encoder.encode(input).length);
      setOutputSize(encoder.encode(result.data).length);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to optimize SVG.");
      }
    }
  };

  // Run on input change or multipass toggle
  useEffect(() => {
    // Only auto-run if input is somewhat small to prevent huge lag, otherwise manual
    if (input.length < 500000) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      processSvg();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, multipass]);

  const percentageSaved = inputSize > 0 ? (((inputSize - outputSize) / inputSize) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 shrink-0">
                <Checkbox 
                  id="multipass" 
                  checked={multipass} 
                  onCheckedChange={(checked) => setMultipass(checked === true)} 
                />
                <Label htmlFor="multipass" className="text-sm cursor-pointer whitespace-nowrap">
                  Multipass Optimization
                </Label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="outline" size="sm" className="shrink-0">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload SVG
                </Button>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              {input.length >= 500000 && (
                 <Button
                 variant="default"
                 size="sm"
                 onClick={processSvg}
                 className="shrink-0"
               >
                 <Play className="w-4 h-4 mr-2" />
                 Optimize Now
               </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!input && !output}
                className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-mono">{error}</span>
        </div>
      )}

      {/* Metrics */}
      {outputSize > 0 && !error && (
        <div className="grid grid-cols-3 gap-4 text-center border rounded-md p-4 bg-card shadow-sm">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Original Size</div>
            <div className="text-xl font-bold">{formatBytes(inputSize)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Optimized Size</div>
            <div className="text-xl font-bold text-brand">{formatBytes(outputSize)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Savings</div>
            <div className="text-xl font-bold text-green-500">{percentageSaved}% Saved</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Raw SVG Input
          </Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your bloated SVG code here..."
            className="w-full min-h-75 font-mono text-xs resize-y"
          />
          {input && !error && (
            <Card className="border overflow-hidden">
              <div className="bg-secondary/50 p-2 text-xs text-center border-b font-medium text-muted-foreground">Original Render Preview</div>
              <CardContent className="p-4 flex items-center justify-center min-h-50 checkerboard-bg">
                <div 
                  className="max-w-full max-h-75 overflow-hidden" 
                  dangerouslySetInnerHTML={{ __html: input }} 
                />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Optimized SVG Output
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!output}
              title="Copy to clipboard"
              className={cn("h-7 w-7 transition-all duration-300", isCopied && "text-green-500 bg-green-500/10 hover:bg-green-500/20 hover:text-green-600")}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
          <Textarea
            readOnly
            value={output}
            placeholder="Optimized result will appear here..."
            className="w-full min-h-75 font-mono text-xs resize-y bg-secondary/20"
          />
          {output && !error && (
            <Card className="border overflow-hidden">
              <div className="bg-brand/10 p-2 text-xs text-center border-b border-brand/20 font-medium text-brand">Optimized Render Preview</div>
              <CardContent className="p-4 flex items-center justify-center min-h-50 checkerboard-bg">
                <div 
                  className="max-w-full max-h-75 overflow-hidden" 
                  dangerouslySetInnerHTML={{ __html: output }} 
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
