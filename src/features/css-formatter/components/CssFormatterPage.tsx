"use client";

import { useState, useEffect } from "react";
import * as prettier from "prettier/standalone";
import * as prettierPluginPostcss from "prettier/plugins/postcss";
import { Copy, Trash2, AlertCircle, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormatMode = "format" | "minify";

export function CssFormatterPage() {
  const [mode, setMode] = useState<FormatMode>("format");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setInput(evt.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  useEffect(() => {
    const processCss = async () => {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }

      try {
        if (mode === "format") {
          const formatted = await prettier.format(input, {
            parser: "css",
            plugins: [prettierPluginPostcss],
          });
          setOutput(formatted);
          setError(null);
        } else {
          // Simple Regex based CSS minification
          // 1. Remove comments
          // 2. Remove whitespace around rules
          // 3. Condense multiple spaces
          const minified = input
            .replace(/\/\*[\s\S]*?\*\//g, "")
            .replace(/\s*([{}|;:,])\s*/g, "$1")
            .replace(/\s+/g, " ")
            .trim();
          setOutput(minified);
          setError(null);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message.split("\n")[0]);
        } else {
          setError("Failed to process CSS.");
        }
      }
    };

    processCss();
  }, [input, mode]);

  return (
    <div className="space-y-6">
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Label className="text-sm">Action:</Label>
              <Select value={mode} onValueChange={(val) => setMode(val as FormatMode)}>
                <SelectTrigger className="w-32 bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="format">Format</SelectItem>
                  <SelectItem value="minify">Minify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="outline" size="sm" className="shrink-0">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload CSS
                </Button>
                <input
                  type="file"
                  accept=".css,text/css"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 flex flex-col">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Raw CSS
          </Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your messy CSS here..."
            className="flex-1 min-h-125 font-mono text-sm resize-y"
          />
        </div>

        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {mode === "format" ? "Formatted Output" : "Minified Output"}
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
            placeholder="Result will appear here..."
            className="flex-1 min-h-125 font-mono text-sm resize-y bg-secondary/20"
          />
        </div>
      </div>
    </div>
  );
}
