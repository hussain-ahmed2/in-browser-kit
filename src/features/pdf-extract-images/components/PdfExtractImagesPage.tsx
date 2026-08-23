"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { FileArchive, Loader2, Play } from "lucide-react";
import { usePdfExtractImages } from "../hooks/usePdfExtractImages";

export function PdfExtractImagesPage() {
  const { file, progress, zipUrl, loadFile, reset, extractImages } = usePdfExtractImages();
  const [ignoreSmall, setIgnoreSmall] = useState(true);

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Extract PDF Images</CardTitle>
        <CardDescription>
          Scan your PDF and extract all embedded images into a downloadable ZIP file.
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
              <span className="font-medium truncate line-clamp-1">{file.name}</span>
              <Button variant="ghost" size="sm" onClick={reset}>
                Change File
              </Button>
            </div>

            {progress.status === "idle" && (
              <FieldGroup className="max-w-xl mx-auto border border-border p-6 rounded-xl bg-card shadow-sm">
                <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <FieldLabel>Ignore Small Images & Icons</FieldLabel>
                    <FieldDescription>
                      Skip images smaller than 100x100 pixels (like tracking pixels or UI icons).
                    </FieldDescription>
                  </div>
                  <FieldContent>
                    <Switch
                      checked={ignoreSmall}
                      onCheckedChange={setIgnoreSmall}
                    />
                  </FieldContent>
                </Field>
                <div className="pt-4 flex justify-end">
                  <Button onClick={() => extractImages(ignoreSmall)}>
                    <Play className="w-4 h-4 mr-2" />
                    Scan & Extract
                  </Button>
                </div>
              </FieldGroup>
            )}

            {(progress.status === "scanning" || progress.status === "zipping") && (
              <div className="max-w-xl mx-auto space-y-4 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand" />
                <h3 className="text-lg font-medium">
                  {progress.status === "scanning" ? "Scanning Pages..." : "Creating ZIP File..."}
                </h3>
                
                {progress.status === "scanning" && (
                  <>
                    <Progress value={progress.totalPages > 0 ? (progress.currentPage / progress.totalPages) * 100 : 0} className="h-2 w-full" />
                    <p className="text-sm text-muted-foreground">
                      Scanning page {progress.currentPage} of {progress.totalPages}
                    </p>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border inline-block min-w-[200px]">
                      <span className="text-2xl font-semibold">{progress.imagesFound}</span>
                      <span className="text-sm text-muted-foreground ml-2">Images Found</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {progress.status === "done" && (
              <div className="max-w-xl mx-auto space-y-6 p-8 border border-border rounded-xl bg-card shadow-sm text-center">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
                  <FileArchive className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-medium">Extraction Complete!</h3>
                <p className="text-muted-foreground">
                  Found and extracted {progress.imagesFound} images from the document.
                </p>
                
                {zipUrl ? (
                  <Button asChild className="w-full sm:w-auto mt-4" size="lg">
                    <a href={zipUrl} download={`${file.name.replace(".pdf", "")}-images.zip`}>
                      <FileArchive className="w-4 h-4 mr-2" />
                      Download ZIP Archive
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full sm:w-auto mt-4" onClick={reset}>
                    Try Another File
                  </Button>
                )}
              </div>
            )}

          </div>
        )}
      </CardContent>
    </Card>
  );
}
