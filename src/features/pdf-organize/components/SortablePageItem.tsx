"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SinglePagePreview } from "@/features/pdf-tools/components/SinglePagePreview";
import type { PDFDocumentProxy } from "pdfjs-dist";
import type { PdfPageItem } from "../hooks/usePdfOrganize";

interface SortablePageItemProps {
  item: PdfPageItem;
  index: number;
  pdfjsDoc: PDFDocumentProxy | null;
  onRemove: (id: string) => void;
}

export function SortablePageItem({
  item,
  index,
  pdfjsDoc,
  onRemove,
}: SortablePageItemProps) {
  const { isDragging, isDropTarget, ref, handleRef } = useSortable({
    id: item.id,
    index,
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex flex-col items-center bg-card border border-border shadow-sm rounded-xl overflow-hidden hover:ring-2 ring-brand/50 transition-all",
        isDragging && "opacity-50 ring-2 ring-brand scale-95 z-50",
        isDropTarget && "ring-2 ring-brand/60 bg-brand/5 scale-[1.02]",
      )}
    >
      {/* Top Header/Drag Handle */}
      <div className="w-full bg-secondary/50 border-b border-border p-2 flex items-center justify-between">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag page ${index + 1}`}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="text-xs font-semibold bg-background border border-border rounded-md px-2 py-0.5 tabular-nums">
          {index + 1}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive h-6 w-6 -mr-1"
          aria-label={`Remove page ${index + 1}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Page Preview */}
      <div className="w-full flex-1 min-h-50 flex items-center justify-center bg-muted/20 p-4 pointer-events-none">
        {pdfjsDoc ? (
          <SinglePagePreview
            pdf={pdfjsDoc}
            pageNumber={item.originalIndex + 1}
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-secondary/50 rounded-md" />
        )}
      </div>
    </div>
  );
}
