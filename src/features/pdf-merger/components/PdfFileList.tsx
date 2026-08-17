"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { ChevronUp, ChevronDown, Trash2, FileDown, GripVertical, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PdfItem } from "@/features/pdf-merger/pdfMergerSlice";

interface PdfFileListProps {
  items: PdfItem[];
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onClearAll: () => void;
}

interface SortableRowProps {
  item: PdfItem;
  index: number;
  isLast: boolean;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

/**
 * A single reorderable file row. Drag is activated from the grip handle
 * (pointer or keyboard); chevrons offer an always-available alternative.
 * Rows register with the DragDropProvider provided by PdfMergerPage.
 */
function SortableRow({ item, index, isLast, onRemove, onMoveUp, onMoveDown }: SortableRowProps) {
  const { isDragging, isDropTarget, ref, handleRef } = useSortable({
    id: item.id,
    index,
    data: { name: item.file.name },
  });

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex items-center justify-between p-3 rounded-lg bg-card border border-border shadow-sm hover:bg-accent/30 transition-colors",
        isDragging && "opacity-40 ring-2 ring-brand/60",
        isDropTarget && "ring-1 ring-brand/60 bg-accent/30"
      )}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag ${item.file.name} to reorder`}
          className="p-1 -m-1 text-muted-foreground/40 hover:text-foreground focus-visible:text-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-brand/15 text-brand text-[11px] font-bold shrink-0">
          {index + 1}
        </span>
        <FileDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
        <p className="font-medium truncate text-sm" title={item.file.name}>
          {item.file.name}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onMoveUp(index)}
          disabled={index === 0}
          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
          aria-label={`Move ${item.file.name} up`}
        >
          <ChevronUp aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onMoveDown(index)}
          disabled={isLast}
          className="text-muted-foreground hover:text-foreground disabled:opacity-20"
          aria-label={`Move ${item.file.name} down`}
        >
          <ChevronDown aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          aria-label={`Remove ${item.file.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Renders the list of selected PDF files as sortable rows.
 */
export function PdfFileList({ items, onRemove, onMoveUp, onMoveDown, onClearAll }: PdfFileListProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Selected Files ({items.length})
        </h3>
        <Button
          variant="ghost"
          size="xs"
          onClick={onClearAll}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3" />
          Clear All
        </Button>
      </div>
      {items.map((item, index) => (
        <SortableRow
          key={item.id}
          item={item}
          index={index}
          isLast={index === items.length - 1}
          onRemove={onRemove}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      ))}
    </div>
  );
}