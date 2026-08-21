"use client";

import { useState, useMemo } from "react";
import { diffWords, diffLines, diffChars } from "diff";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DiffMode = "words" | "lines" | "chars";

export function DiffCheckerPage() {
  const [originalText, setOriginalText] = useState("");
  const [modifiedText, setModifiedText] = useState("");
  const [diffMode, setDiffMode] = useState<DiffMode>("words");

  const diffResult = useMemo(() => {
    if (!originalText && !modifiedText) return [];
    
    switch (diffMode) {
      case "lines":
        return diffLines(originalText, modifiedText);
      case "chars":
        return diffChars(originalText, modifiedText);
      case "words":
      default:
        return diffWords(originalText, modifiedText);
    }
  }, [originalText, modifiedText, diffMode]);

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center mb-4">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Compare Mode:</Label>
          <Select value={diffMode} onValueChange={(v) => setDiffMode(v as DiffMode)}>
            <SelectTrigger className="w-35">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="words">Words</SelectItem>
              <SelectItem value="lines">Lines</SelectItem>
              <SelectItem value="chars">Characters</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Original Text</Label>
          <Textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your original text here..."
            className="min-h-62.5 font-mono text-sm resize-y"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Modified Text</Label>
          <Textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste your modified text here..."
            className="min-h-62.5 font-mono text-sm resize-y"
          />
        </div>
      </div>

      <Card className="mt-8 border-border bg-card">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/30">
            <h3 className="font-semibold text-sm">Diff Result</h3>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Removed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span> Added</span>
            </div>
          </div>
          <div className="p-4 overflow-auto max-h-150 text-sm font-mono whitespace-pre-wrap leading-relaxed">
            {!originalText && !modifiedText ? (
              <span className="text-muted-foreground italic">Result will appear here...</span>
            ) : (
              diffResult.map((part, index) => {
                const colorClass = part.added
                  ? "bg-green-500/20 text-green-700 dark:text-green-300 px-0.5 rounded-sm"
                  : part.removed
                  ? "bg-red-500/20 text-red-700 dark:text-red-300 line-through px-0.5 rounded-sm"
                  : "text-foreground";
                
                return (
                  <span key={index} className={colorClass}>
                    {part.value}
                  </span>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
