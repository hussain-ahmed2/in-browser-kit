"use client";

import { useState } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PdfMergerResultProps {
  mergedPdfUrl: string;
}

/**
 * Displays the success message and download button for the merged PDF.
 * Allows the user to specify a custom filename.
 */
export function PdfMergerResult({ mergedPdfUrl }: PdfMergerResultProps) {
  const [filename, setFilename] = useState("Merged_Document");

  return (
    <div className="space-y-6">
      <Alert variant="success">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Merger Complete!</AlertTitle>
        <AlertDescription className="mt-1 text-foreground">
          Your files have been successfully combined.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-6 border-t border-border">
        <div className="space-y-2 w-full sm:w-auto flex-1 max-w-sm">
          <Label htmlFor="filename">Output File Name</Label>
          <div className="flex items-center space-x-2">
            <Input 
              id="filename" 
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Merged_Document"
            />
            <span className="text-sm text-muted-foreground">.pdf</span>
          </div>
        </div>
        
        <Button asChild className="w-full sm:w-auto shrink-0" variant="success">
          <a href={mergedPdfUrl} download={`${filename || "Merged_Document"}.pdf`}>
            <Download aria-hidden="true" />
            Download Merged PDF
          </a>
        </Button>
      </div>
    </div>
  );
}
