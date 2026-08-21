"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { ArrowLeftRight, Copy, Download, AlertCircle, Check, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConvertMode = "csv-to-json" | "json-to-csv";

export function CsvJsonConverterPage() {
  const [mode, setMode] = useState<ConvertMode>("csv-to-json");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Options
  const [delimiter, setDelimiter] = useState<string>("auto");
  const [hasHeader, setHasHeader] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);

  // Swap function
  const handleSwap = () => {
    setMode((m) => (m === "csv-to-json" ? "json-to-csv" : "csv-to-json"));
    setInput(output);
    setOutput("");
    setError(null);
  };

  // Convert logic
  useEffect(() => {
    if (!input.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOutput("");
      setError(null);
      return;
    }

    try {
      if (mode === "csv-to-json") {
        const papaConfig: Papa.ParseConfig = {
          header: hasHeader,
          skipEmptyLines: true,
        };
        
        if (delimiter !== "auto") {
          papaConfig.delimiter = delimiter;
        }

        const result = Papa.parse(input, papaConfig);
        
        if (result.errors && result.errors.length > 0) {
          // If there are parsing errors but we still got data, we might show a warning, 
          // but let's just proceed with the data we have for now, or show the first error.
        }

        setOutput(JSON.stringify(result.data, null, prettyPrint ? 2 : undefined));
        setError(null);

      } else {
        // json-to-csv
        const parsedJson = JSON.parse(input);
        
        // Ensure it's an array for Papa.unparse
        const dataToUnparse = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        
        const csv = Papa.unparse(dataToUnparse, {
          delimiter: delimiter === "auto" ? "," : delimiter,
          header: hasHeader,
        });

        setOutput(csv);
        setError(null);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during conversion.");
      }
    }
  }, [input, mode, delimiter, hasHeader, prettyPrint]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = mode === "csv-to-json" ? "converted.json" : "converted.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded successfully");
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

  const inputLabel = mode === "csv-to-json" ? "CSV Input" : "JSON Input";
  const outputLabel = mode === "csv-to-json" ? "JSON Output" : "CSV Output";

  return (
    <div className="space-y-6">
      <Card className="border-border bg-secondary/30">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 w-full overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex items-center gap-2 shrink-0">
                <Label className="text-sm">Delimiter</Label>
                <Select value={delimiter} onValueChange={setDelimiter}>
                  <SelectTrigger className="w-30 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Checkbox id="header-row" checked={hasHeader} onCheckedChange={(checked) => setHasHeader(checked === true)} />
                <Label htmlFor="header-row" className="text-sm cursor-pointer whitespace-nowrap">
                  {mode === "csv-to-json" ? "First row is header" : "Include header row"}
                </Label>
              </div>

              {mode === "csv-to-json" && (
                <div className="flex items-center gap-2 shrink-0">
                  <Checkbox id="pretty-print" checked={prettyPrint} onCheckedChange={(checked) => setPrettyPrint(checked === true)} />
                  <Label htmlFor="pretty-print" className="text-sm cursor-pointer whitespace-nowrap">
                    Pretty Print
                  </Label>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {mode === "csv-to-json" ? "CSV" : "JSON"}
                </Button>
                <input
                  type="file"
                  accept={mode === "csv-to-json" ? ".csv,text/csv" : ".json,application/json"}
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                className="shrink-0 group hover:bg-brand hover:text-brand-foreground hover:border-brand transition-colors"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Swap Direction
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
            {inputLabel}
          </Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Paste your ${mode === "csv-to-json" ? "CSV" : "JSON"} data here...`}
            className="flex-1 min-h-150 font-mono text-sm resize-y"
          />
        </div>
        
        <div className="space-y-2 flex flex-col">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              {outputLabel}
            </Label>
            <div className="flex items-center gap-2">
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                disabled={!output}
                title="Download file"
                className="h-7 w-7"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <Textarea
            readOnly
            value={output}
            placeholder="Converted output will appear here..."
            className="flex-1 min-h-150 font-mono text-sm resize-y bg-secondary/20"
          />
        </div>
      </div>
    </div>
  );
}
