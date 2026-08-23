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
import { Download, Layers, Loader2 } from "lucide-react";
import { usePdfFlatten } from "../hooks/usePdfFlatten";

export function PdfFlattenPage() {
  const { file, progress, downloadUrl, loadFile, reset, flattenPdf } =
    usePdfFlatten();

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Flatten PDF</CardTitle>
        <CardDescription>
          Permanently burn form fields and interactive elements into the visual layer.
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
              <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-card shadow-sm text-center space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                  <Layers className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium">Ready to Flatten</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Flattening a PDF ensures that all interactive elements, like text fields and checkboxes, are permanently baked into the document. The resulting file cannot be edited by standard form tools.
                </p>
                <Button size="lg" onClick={flattenPdf}>
                  Flatten Document
                </Button>
              </div>
            )}

            {progress.status === "flattening" && (
              <div className="flex flex-col items-center justify-center p-12 border border-border rounded-xl bg-card shadow-sm text-center space-y-4 max-w-xl mx-auto">
                <Loader2 className="w-10 h-10 animate-spin text-brand" />
                <h3 className="text-lg font-medium">Flattening PDF...</h3>
                <p className="text-sm text-muted-foreground">
                  Processing form fields and baking them into the visual layer...
                </p>
              </div>
            )}

            {progress.status === "done" && downloadUrl && (
              <div className="flex flex-col items-center justify-center p-8 border border-brand/30 bg-brand/5 rounded-xl shadow-sm text-center space-y-4 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-brand/20 text-brand flex items-center justify-center mb-2">
                  <Download className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium">Success!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your document has been fully flattened.
                </p>
                <Button
                  size="lg"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = `flattened_${file.name}`;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Flattened PDF
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
