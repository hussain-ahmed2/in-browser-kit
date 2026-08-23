"use client";

import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SinglePagePreview } from "@/features/pdf-tools/components/SinglePagePreview";
import { Copy, Download, FileText, Loader2, Play } from "lucide-react";
import { usePdfToText } from "../hooks/usePdfToText";
import { toast } from "sonner";

export function PdfToTextPage() {
  const {
    file,
    pdfDoc,
    progress,
    extractedText,
    setExtractedText,
    loadFile,
    reset,
    extractText,
    downloadTextFile,
  } = usePdfToText();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(extractedText);
      toast.success("Text copied to clipboard!");
    } catch {
      toast.error("Failed to copy text.");
    }
  };

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>PDF to Text</CardTitle>
        <CardDescription>
          Extract raw, searchable text from any PDF document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!file ? (
          <FileDropzone
            accept="application/pdf"
            onFiles={(files: File[]) => {
              if (files[0]) loadFile(files[0]);
            }}
            label="Click or drag and drop your PDF here"
          />
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="font-medium truncate line-clamp-1">
                {file.name}
              </span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Change File
              </Button>
            </div>

            {progress.status === "idle" && (
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* PDF Preview */}
                <div className="w-full lg:w-1/2 bg-muted/20 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                  {pdfDoc ? (
                    <SinglePagePreview pdf={pdfDoc} pageNumber={1} />
                  ) : (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  )}
                </div>

                {/* Extract Controls */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center h-full min-h-[300px] border border-border p-6 rounded-xl bg-card shadow-sm text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium">Ready to Extract</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mb-4">
                    We will scan every page in your document and extract the raw text, preserving basic line breaks.
                  </p>
                  <Button size="lg" onClick={extractText} disabled={!pdfDoc}>
                    <Play className="w-4 h-4 mr-2" />
                    Extract Text
                  </Button>
                </div>
              </div>
            )}

            {progress.status === "scanning" && (
              <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                <h3 className="text-lg font-medium">Reading Text...</h3>
                <Progress
                  value={
                    progress.totalPages > 0
                      ? (progress.currentPage / progress.totalPages) * 100
                      : 0
                  }
                  className="h-2 w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Scanning page {progress.currentPage} of {progress.totalPages}
                </p>
              </div>
            )}

            {progress.status === "done" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-2 rounded-lg border border-border">
                  <div className="flex items-center gap-2 pl-2">
                    <FileText className="w-5 h-5 text-brand" />
                    <span className="font-medium">Extracted Text</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={handleCopy} className="flex-1 sm:flex-none">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={downloadTextFile} className="flex-1 sm:flex-none">
                      <Download className="w-4 h-4 mr-2" />
                      Download .txt
                    </Button>
                  </div>
                </div>

                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="No text was found..."
                  className="w-full min-h-[50vh] p-6 rounded-xl border border-border bg-card shadow-sm focus:ring-2 focus:ring-brand focus:outline-none resize-y font-mono text-sm leading-relaxed"
                  spellCheck={false}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
