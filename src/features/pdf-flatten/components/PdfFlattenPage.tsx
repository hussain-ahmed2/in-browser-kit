"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { PdfResult } from "@/features/pdf-tools/components/PdfResult";
import { PdfUploader } from "@/features/pdf-tools/components/PdfUploader";
import { Layers, Loader2, AlertTriangle } from "lucide-react";
import { usePdfFlatten } from "../hooks/usePdfFlatten";

const steps = [{ label: "Upload" }, { label: "Flatten" }, { label: "Download" }];

export function PdfFlattenPage() {
  const { file, hasFormFields, progress, downloadUrl, loadFile, reset, flattenPdf } =
    usePdfFlatten();

  const currentStep = progress.status === "done" ? 2 : file ? 1 : 0;

  return (
    <>
      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Flatten PDF</CardTitle>
          <CardDescription>
            Permanently burn form fields and interactive elements into the visual layer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {!file ? (
            <PdfUploader onFileSelect={loadFile} hint="Choose a PDF to flatten" />
          ) : progress.status === "done" && downloadUrl ? (
            <PdfResult
              url={downloadUrl}
              title="Flatten Complete!"
              description="Your flattened PDF is ready to download. All form fields have been permanently baked into the document."
              defaultFilename={`flattened_${file.name.replace(/\.pdf$/i, "")}`}
              buttonLabel="Download Flattened PDF"
              onStartOver={reset}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Warning if no form fields detected */}
              {!hasFormFields && (
                <Alert variant="warning">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <AlertTitle>No form fields detected</AlertTitle>
                  <AlertDescription>
                    This PDF does not appear to contain interactive form fields. Flattening will still
                    process the document, but no visible changes may occur.
                  </AlertDescription>
                </Alert>
              )}

              {progress.status === "idle" && (
                <div className="flex flex-col items-center justify-center p-8 border border-border rounded-xl bg-card shadow-sm text-center space-y-4 max-w-xl mx-auto">
                  <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-2">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-medium">Ready to Flatten</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Flattening a PDF ensures that all interactive elements, like text fields and
                    checkboxes, are permanently baked into the document. The resulting file cannot be
                    edited by standard form tools.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>
                      Change File
                    </Button>
                    <Button size="lg" onClick={flattenPdf}>
                      Flatten Document
                    </Button>
                  </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
