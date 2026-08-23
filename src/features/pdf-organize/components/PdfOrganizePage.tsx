"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { move } from "@dnd-kit/helpers";
import { Loader2, Save, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileDropzone } from "@/components/FileDropzone";
import { usePdfDocument } from "@/features/pdf-tools/lib/usePdfDocument";
import { usePdfOrganize } from "../hooks/usePdfOrganize";
import { SortablePageItem } from "./SortablePageItem";

export function PdfOrganizePage() {
  const {
    originalFile,
    pages,
    isExtracting,
    isProcessing,
    setPages,
    loadFile,
    removePage,
    reset,
    savePdf,
  } = usePdfOrganize();

  const { pdf: pdfjsDoc, error: previewError } = usePdfDocument(originalFile);

  const handleFilesSelect = (files: File[]) => {
    const validFile = files.find((f) => f.type === "application/pdf");
    if (validFile) {
      loadFile(validFile);
    }
  };

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle>Organize PDF Pages</CardTitle>
        <CardDescription>
          Drag and drop to reorder pages, or click the trash icon to remove
          them.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {!originalFile ? (
          isExtracting ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p>Loading PDF pages...</p>
            </div>
          ) : (
            <FileDropzone
              accept="application/pdf"
              onFiles={handleFilesSelect}
              label="Click or drag and drop your PDF here"
            />
          )
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Actions */}
            <div className="p-4 bg-muted/50 rounded-lg border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-hidden w-full sm:w-auto">
                <FilePlus className="w-5 h-5 text-brand shrink-0" />
                <span className="font-medium truncate">
                  {originalFile.name}
                </span>
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  ({pages.length} pages)
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="w-full sm:w-auto"
                >
                  Change File
                </Button>
                <Button
                  onClick={savePdf}
                  disabled={isProcessing || pages.length === 0}
                  className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" aria-hidden="true" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save aria-hidden="true" data-icon="inline-start" />
                      Save PDF
                    </>
                  )}
                </Button>
              </div>
            </div>

            {previewError && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 text-sm">
                {previewError}
              </div>
            )}

            {pages.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                No pages remaining. Add a different file or reset.
              </div>
            ) : (
              <DragDropProvider
                onDragEnd={(event) => {
                  if (event.canceled) return;
                  const { source, target } = event.operation;
                  if (!source || !target) return;
                  setPages((prev) => move(prev, event));
                }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {pages.map((item, index) => (
                    <SortablePageItem
                      key={item.id}
                      item={item}
                      index={index}
                      pdfjsDoc={pdfjsDoc}
                      onRemove={removePage}
                    />
                  ))}
                </div>
              </DragDropProvider>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
