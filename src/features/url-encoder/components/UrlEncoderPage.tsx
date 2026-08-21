"use client";

import { useState, useEffect } from "react";
import { ArrowLeftRight, Copy, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type ConvertMode = "encode" | "decode";

export function UrlEncoderPage() {
  const [mode, setMode] = useState<ConvertMode>("encode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Swap function
  const handleSwap = () => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setError(null);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  // Convert logic
  useEffect(() => {
    if (!input) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "encode") {
        setOutput(encodeURIComponent(input));
        setError(null);
      } else {
        setOutput(decodeURIComponent(input));
        setError(null);
      }
    } catch (err: unknown) {
      if (err instanceof URIError) {
        setError("Malformed URI component: Cannot decode.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setOutput("");
    }
  }, [input, mode]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="space-y-6">
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            <h2 className="text-sm font-medium flex items-center gap-2">
              Current Mode: <span className="font-bold text-brand uppercase">{mode}</span>
            </h2>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="shrink-0 group hover:bg-brand hover:text-brand-foreground hover:border-brand transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Swap Direction
              </Button>
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
            Input ({mode === "encode" ? "Raw Text" : "Encoded URI"})
          </Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${mode === "encode" ? "text to encode" : "URI to decode"} here...`}
            className="flex-1 min-h-62.5 font-mono text-sm resize-y"
          />
        </div>
        
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Output ({mode === "encode" ? "Encoded URI" : "Decoded Text"})
            </Label>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!output}
              title="Copy to clipboard"
              className="h-7 w-7"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
          </div>
          <Textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="flex-1 min-h-62.5 font-mono text-sm resize-y bg-secondary/20"
          />
        </div>
      </div>
    </div>
  );
}
