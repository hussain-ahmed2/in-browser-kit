"use client";

import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { PointerSensor } from "@dnd-kit/dom";
import { move } from "@dnd-kit/helpers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfUploader } from "./PdfUploader";
import { PdfFileList } from "./PdfFileList";
import { PdfMergerResult } from "./PdfMergerResult";
import { StepIndicator } from "@/components/StepIndicator";
import { genId } from "@/lib/id";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearItems,
  fileRemoved,
  filesAdded,
  itemsReplaced,
  mergePdfs,
  selectIsMerging,
  selectItems,
  selectMergedPdfUrl,
} from "@/features/pdf-merger/pdfMergerSlice";

const steps = [
  { label: "Upload" },
  { label: "Arrange" },
  { label: "Download" },
];

export function PdfMergerPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectItems);
  const mergedPdfUrl = useAppSelector(selectMergedPdfUrl);
  const isMerging = useAppSelector(selectIsMerging);

  const currentStep = mergedPdfUrl ? 2 : items.length > 1 ? 1 : 0;

  const handleFilesSelect = (selectedFiles: File[]) => {
    dispatch(filesAdded(selectedFiles.map((file) => ({ id: genId(), file }))));
  };

  const removeFile = (index: number) => dispatch(fileRemoved(index));

  const clearAll = () => dispatch(clearItems());

  const moveUp = (index: number) => {
    if (index <= 0) return;
    dispatch(itemsReplaced(moveInArray(items, index, index - 1)));
  };

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return;
    dispatch(itemsReplaced(moveInArray(items, index, index + 1)));
  };

  const handleDragEnd: NonNullable<React.ComponentProps<typeof DragDropProvider>["onDragEnd"]> = (event) => {
    if (event.canceled) return;
    const { source, target } = event.operation;
    if (!source || !target) return;
    dispatch(itemsReplaced(move(items, event)));
  };

  const handleMerge = async () => {
    if (items.length < 2) {
      toast.error("Please add at least 2 PDF files to merge.");
      return;
    }

    try {
      await dispatch(mergePdfs()).unwrap();
      toast.success("PDFs merged successfully!");
    } catch (error: unknown) {
      console.error("PDF Merge Failed:", error);
      toast.error("Error merging PDFs. A file might be corrupted or password protected.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand/25 to-glow/15 text-brand ring-1 ring-brand/25 shadow-[0_0_32px_-8px] shadow-brand/50 mb-4 animate-fade-in-up stagger-1">
          <FileDown size={32} aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight animate-fade-in-up stagger-2">PDF Merger</h1>
        <p className="text-muted-foreground text-lg animate-fade-in-up stagger-3">
          Combine multiple PDF files into one. 100% processed securely in your browser.
        </p>
      </header>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
        <CardHeader>
          <CardTitle>Add PDF Files</CardTitle>
          <CardDescription>Select and arrange multiple PDFs to merge them into a single document.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <PdfUploader onFilesSelect={handleFilesSelect} />

          <DragDropProvider
            onDragEnd={handleDragEnd}
            sensors={(defaults) => [
              ...defaults.filter((sensor) => sensor !== PointerSensor),
              PointerSensor.configure({
                // Drags only ever start from the grip handle (touch-action: none),
                // so there's no scroll gesture to disambiguate — begin immediately
                // on both mouse and touch instead of requiring the touch hold.
                activationConstraints: () => undefined,
              }),
            ]}
          >
            <PdfFileList
              items={items}
              onRemove={removeFile}
              onMoveUp={moveUp}
              onMoveDown={moveDown}
              onClearAll={clearAll}
            />
            <DragOverlay>
              {(source) => {
                const name = (source.data?.name as string | undefined) ?? "";
                return (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border shadow-xl shadow-brand/10 ring-2 ring-brand/60">
                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40" aria-hidden="true" />
                    <FileDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                    <p className="font-medium truncate text-sm">{name}</p>
                  </div>
                );
              }}
            </DragOverlay>
          </DragDropProvider>

          {mergedPdfUrl ? (
            <div className="animate-fade-in">
              <PdfMergerResult mergedPdfUrl={mergedPdfUrl} />
            </div>
          ) : items.length > 0 ? (
            <div className="flex justify-end gap-4 pt-6 border-t border-border">
              <Button
                onClick={handleMerge}
                disabled={isMerging || items.length < 2}
                className="w-full sm:w-auto bg-gradient-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
              >
                {isMerging ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Merging...
                  </>
                ) : (
                  "Merge PDFs"
                )}
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </main>
  );
}

function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}